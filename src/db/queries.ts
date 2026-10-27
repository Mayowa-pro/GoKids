import { and, asc, eq, gte, isNull, like, lt, lte, or } from "drizzle-orm";
import { covers, sameEventKey } from "@/lib/dedupe";
import { ageRange, dateWindow, type EventFilters } from "@/lib/filters";
import { nextOccurrence } from "@/lib/recurrence";
import { londonDateKey } from "@/lib/time";
import { db } from ".";
import { events, type EventRow } from "./schema";

export type PublicEvent = Omit<EventRow, "contactEmail" | "status" | "createdAt"> & {
  featured: boolean;
  /** When the listing was added, used as the date tickets were "on offer" from for search engines. */
  listedAt: Date;
  /** Later dates of the same event inside the chosen window, shown as "Also on …" instead of a second card. */
  alsoOn?: Date[];
};

function toPublic(e: EventRow, now: Date): PublicEvent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contactEmail, status, createdAt, ...rest } = e;
  return { ...rest, listedAt: createdAt, featured: !!e.featuredUntil && e.featuredUntil > now };
}

export async function listEvents(region: string, f: EventFilters, now = new Date()): Promise<PublicEvent[]> {
  const { from, to } = dateWindow(f.when, now, f.date);
  const { min, max } = ageRange(f.age);
  const q = f.q ? `%${f.q.replace(/[%_]/g, "")}%` : null;

  const shared = and(
    eq(events.region, region),
    eq(events.status, "approved"),
    lte(events.minAge, max),
    gte(events.maxAge, min),
    f.free ? eq(events.isFree, true) : undefined,
    // A budget keeps free events and ones whose cheapest ticket fits; unknown prices are left out.
    !f.free && f.max ? or(eq(events.isFree, true), lte(events.priceFrom, f.max * 100)) : undefined,
    q
      ? or(like(events.title, q), like(events.venue, q), like(events.category, q), like(events.organiser, q), like(events.description, q))
      : undefined,
  );

  const [oneOff, weekly] = await Promise.all([
    db
      .select()
      .from(events)
      .where(and(shared, eq(events.repeatsWeekly, false), gte(events.endsAt, from), lt(events.startsAt, to)))
      .orderBy(asc(events.startsAt))
      .limit(300),
    db
      .select()
      .from(events)
      .where(and(shared, eq(events.repeatsWeekly, true), lt(events.startsAt, to), or(isNull(events.repeatUntil), gte(events.repeatUntil, from))))
      .limit(300),
  ]);

  // Weekly sessions show once, on their next date inside the window.
  const upcomingWeekly = weekly
    .map((e) => nextOccurrence(e, from))
    .filter((e): e is EventRow => !!e && e.startsAt < to);

  const rows = [...oneOff, ...upcomingWeekly].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return mergeRepeats(rows.map((r) => toPublic(r, now)));
}

/**
 * One card per event: drops copies of the same event and folds later dates of the
 * same event at the same venue (including a second weekly session) into the first card. Expects rows sorted by start.
 */
export function mergeRepeats(list: PublicEvent[]): PublicEvent[] {
  const out: PublicEvent[] = [];
  for (const e of list) {
    const copyOf = out.find((k) => covers(k, e) || covers(e, k));
    const earlier = copyOf ?? out.find((k) => sameEventKey(k) === sameEventKey(e));
    if (!earlier) {
      out.push({ ...e });
      continue;
    }
    if (e.featured) earlier.featured = true;
    const day = londonDateKey(e.startsAt);
    if (!copyOf && day !== londonDateKey(earlier.startsAt) && !earlier.alsoOn?.some((d) => londonDateKey(d) === day)) {
      (earlier.alsoOn ??= []).push(e.startsAt);
    }
  }
  return out;
}

export async function getEventBySlug(slug: string, now = new Date()): Promise<PublicEvent | null> {
  const [row] = await db.select().from(events).where(and(eq(events.slug, slug), eq(events.status, "approved"))).limit(1);
  if (!row) return null;
  return toPublic(nextOccurrence(row, now) ?? row, now);
}

export async function listByStatus(status: EventRow["status"]): Promise<EventRow[]> {
  return db.select().from(events).where(eq(events.status, status)).orderBy(asc(events.startsAt)).limit(200);
}

export async function listUpcomingSlugs(now = new Date()) {
  return db
    .select({ slug: events.slug, region: events.region })
    .from(events)
    .where(and(eq(events.status, "approved"), or(gte(events.endsAt, now), eq(events.repeatsWeekly, true))));
}

/** The next few one-off events after `after`, for the "Coming up" box. */
export async function listComingUp(region: string, after: Date, limit = 4, now = new Date()): Promise<PublicEvent[]> {
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.region, region), eq(events.status, "approved"), eq(events.repeatsWeekly, false), gte(events.startsAt, after)))
    .orderBy(asc(events.startsAt))
    .limit(limit * 4);
  return mergeRepeats(rows.map((r) => toPublic(r, now))).slice(0, limit);
}
