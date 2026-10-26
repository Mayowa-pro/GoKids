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
import { covers } from "../lib/dedupe";
import { priceFromText } from "../lib/price";
import { londonMidnight, weekday } from "../lib/time";
import { scoutedEventSchema } from "../lib/validation";
import { db } from "./index";
import { removeDuplicates } from "./dedupe";
import { fillPrices } from "./prices";
import { events } from "./schema";

const DIR = path.join(process.cwd(), "data", "scouted");
/** Events the site owner supplied directly (e.g. pasted from a library timetable). These go live without approval. */
const CURATED_DIR = path.join(process.cwd(), "data", "curated");

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function at(date: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(londonMidnight(date).getTime() + (h * 60 + m) * 60_000);
}

export async function importScouted(dir = DIR, origin: "scout" | "curated" = "scout") {
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  let added = 0, skipped = 0, invalid = 0;
  const seen: string[] = [];
  const known =
    origin === "scout"
      ? await db
          .select({ id: events.id, title: events.title, venue: events.venue, startsAt: events.startsAt, endsAt: events.endsAt, repeatsWeekly: events.repeatsWeekly })
          .from(events)
          .where(eq(events.isSample, false))
      : [];

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
      // Venue and day are part of the address, so the same session at two places or on two weekdays stays separate.
      const slug = e.repeatsWeekly
        ? `${slugify(e.title)}-${slugify(e.venue)}-${DAYS[weekday(e.date)]}-weekly`
        : `${slugify(e.title)}-${slugify(e.venue)}-${e.date}`;
      seen.push(slug);
      const repeatUntil = e.repeatUntil ? at(e.repeatUntil, "23:59") : null;
      const finished = e.repeatsWeekly ? !!repeatUntil && repeatUntil < new Date() : endsAt < new Date();
      if (finished) { skipped++; continue; }

      const [existing] = await db.select({ id: events.id, status: events.status }).from(events).where(eq(events.slug, slug)).limit(1);
      // Scouted events already approved or turned down are left alone; ones still waiting pick up corrections below.
      if (existing && origin === "scout" && existing.status !== "pending") { skipped++; continue; }
      if (origin === "scout" && !existing) {
        // Skip anything already listed (or already turned down), even under a different address.
        const candidate = { id: -1, title: e.title, venue: e.venue, startsAt: at(e.date, e.start), endsAt, repeatsWeekly: !!e.repeatsWeekly };
        if (known.some((k) => covers(k, candidate) || covers(candidate, k))) { skipped++; continue; }
      }

      const region = LIVE_REGIONS.find((rg) => rg.areas.some((a) => a.slug === e.area))!;
      const area = region.areas.find((a) => a.slug === e.area)!;
      const point =
        e.lat !== undefined && e.lng !== undefined ? { lat: e.lat, lng: e.lng }
        : (e.postcode && (await geocodePostcode(e.postcode))) || { lat: area.lat, lng: area.lng };

      const values = {
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
        repeatsWeekly: e.repeatsWeekly ?? false,
        repeatUntil,
        isFree: e.isFree,
        priceText: e.isFree ? null : (e.priceText ?? "See website"),
        priceFrom: e.priceFrom !== undefined ? Math.round(e.priceFrom * 100) : priceFromText(e.isFree, e.priceText),
        minAge: e.minAge,
        maxAge: e.maxAge,
        organiser: e.organiser,
        bookingUrl: e.bookingUrl ?? e.sourceUrl,
        sourceUrl: e.sourceUrl,
        origin,
        status: origin === "curated" ? ("approved" as const) : ("pending" as const),
      };
      if (existing) {
        // Curated files are the source of truth, so keep the live listing in step with them.
        // The same goes for scouted events still waiting for approval, so fixes to a batch show up at /admin.
        await db.update(events).set(values).where(eq(events.id, existing.id));
        skipped++;
        continue;
      }
      await db.insert(events).values(values);
      added++;
    }
  }
  // Tidy the queue: drop scouted events still waiting for approval that no file lists any more
  // (for example after a batch was corrected). Approved or rejected events are never touched.
  const stale = await db
    .delete(events)
    .where(and(eq(events.origin, origin), eq(events.status, origin === "curated" ? "approved" : "pending"), seen.length ? not(inArray(events.slug, seen)) : undefined))
    .returning({ id: events.id });
  if (stale.length) console.log(`Removed ${stale.length} outdated ${origin} events.`);

  console.log(`${origin === "curated" ? "Curated" : "Scouted"} events: ${added} added${origin === "scout" ? " for approval" : ""}, ${skipped} already in or finished, ${invalid} invalid.`);
  return { added, skipped, invalid };
}

if (process.argv[1]?.endsWith("import-scouted.ts")) {
  // Owner-supplied events first, so the scout can see them and skip copies.
  importScouted(CURATED_DIR, "curated")
    .then(() => importScouted())
    .then(() => removeDuplicates())
    .then(() => fillPrices())
    .catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
