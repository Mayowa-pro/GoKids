import { and, asc, eq, gte, isNull, like, lt, lte, or } from "drizzle-orm";
import { ageRange, dateWindow, type EventFilters } from "@/lib/filters";
import { nextOccurrence } from "@/lib/recurrence";
import { db } from ".";
import { events, type EventRow } from "./schema";

export type PublicEvent = Omit<EventRow, "contactEmail" | "status" | "createdAt"> & { featured: boolean };

function toPublic(e: EventRow, now: Date): PublicEvent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contactEmail, status, createdAt, ...rest } = e;
  return { ...rest, featured: !!e.featuredUntil && e.featuredUntil > now };
}

export async function listEvents(region: string, f: EventFilters, now = new Date()): Promise<PublicEvent[]> {
  const { from, to } = dateWindow(f.when, now);
  const { min, max } = ageRange(f.age);
  const q = f.q ? `%${f.q.replace(/[%_]/g, "")}%` : null;

  const shared = and(
    eq(events.region, region),
    eq(events.status, "approved"),
    lte(events.minAge, max),
    gte(events.maxAge, min),
    f.free ? eq(events.isFree, true) : undefined,
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
  return rows.map((r) => toPublic(r, now));
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
