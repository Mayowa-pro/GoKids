/**
 * Imports events the weekly scout saved in data/scouted/*.json.
 * They arrive as "pending", so nothing goes live until a moderator approves it.
 * Safe to run on every deploy: events already in the database are skipped.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, inArray, not } from "drizzle-orm";
import { geocodePostcode } from "../lib/postcode";
import { LIVE_REGIONS } from "../lib/site";
import { slugify } from "../lib/slug";
import { londonMidnight } from "../lib/time";
import { scoutedEventSchema } from "../lib/validation";
import { db } from "./index";
import { events } from "./schema";

const DIR = path.join(process.cwd(), "data", "scouted");

function at(date: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(londonMidnight(date).getTime() + (h * 60 + m) * 60_000);
}

export async function importScouted(dir = DIR) {
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  let added = 0, skipped = 0, invalid = 0;
  const seen: string[] = [];

  for (const file of files) {
    let raw;
    try {
      raw = JSON.parse(await readFile(path.join(dir, file), "utf8"));
    } catch (err) {
      // A broken file shouldn't stop the site from deploying.
      console.warn(`${file}: could not read it, skipping (${(err as Error).message})`);
      continue;
    }
    const list: unknown[] = Array.isArray(raw) ? raw : raw.events ?? [];
    for (const item of list) {
      const r = scoutedEventSchema.safeParse(item);
      if (!r.success) {
        invalid++;
        console.warn(`${file}: skipped an invalid event: ${r.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
        continue;
      }
      const e = r.data;
      const endsAt = at(e.endDate ?? e.date, e.end);
      const slug = `${slugify(e.title)}-${e.date}`;
      seen.push(slug);
      if (endsAt < new Date()) { skipped++; continue; }

      const [existing] = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1);
      if (existing) { skipped++; continue; }

      const region = LIVE_REGIONS.find((rg) => rg.areas.some((a) => a.slug === e.area))!;
      const area = region.areas.find((a) => a.slug === e.area)!;
      const point =
        e.lat !== undefined && e.lng !== undefined ? { lat: e.lat, lng: e.lng }
        : (e.postcode && (await geocodePostcode(e.postcode))) || { lat: area.lat, lng: area.lng };

      await db.insert(events).values({
        slug,
        title: e.title,
        description: e.description,
        category: e.category,
        region: region.slug,
        area: e.area,
        venue: e.venue,
        postcode: e.postcode ?? null,
        lat: point.lat,
        lng: point.lng,
        startsAt: at(e.date, e.start),
        endsAt,
        timesNote: e.timesNote ?? null,
        isFree: e.isFree,
        priceText: e.isFree ? null : (e.priceText ?? "See website"),
        minAge: e.minAge,
        maxAge: e.maxAge,
        organiser: e.organiser,
        bookingUrl: e.bookingUrl ?? e.sourceUrl,
        sourceUrl: e.sourceUrl,
        origin: "scout",
        status: "pending",
      });
      added++;
    }
  }
  // Tidy the queue: drop scouted events still waiting for approval that no file lists any more
  // (for example after a batch was corrected). Approved or rejected events are never touched.
  const stale = await db
    .delete(events)
    .where(and(eq(events.origin, "scout"), eq(events.status, "pending"), seen.length ? not(inArray(events.slug, seen)) : undefined))
    .returning({ id: events.id });
  if (stale.length) console.log(`Removed ${stale.length} outdated scouted events from the approval queue.`);

  console.log(`Scouted events: ${added} added for approval, ${skipped} already in or finished, ${invalid} invalid.`);
  return { added, skipped, invalid };
}

if (process.argv[1]?.endsWith("import-scouted.ts")) {
  importScouted().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
