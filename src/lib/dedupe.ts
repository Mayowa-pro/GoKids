/**
 * Spots listings that are the same event twice, e.g. the scout and the organiser both adding it,
 * or an old one-day listing left behind after a run of days was merged into one.
 */
import { slugify } from "./slug";
import { formatTime, londonDateKey, weekday } from "./time";

export type DedupeRow = {
  id: number;
  title: string;
  venue: string;
  startsAt: Date;
  endsAt: Date;
  repeatsWeekly: boolean;
  status?: string;
  origin?: string;
  featuredUntil?: Date | null;
  createdAt?: Date;
};

/** Same title at the same place, ignoring case, punctuation and "&" vs "and". */
export function sameEventKey(e: { title: string; venue: string }): string {
  return `${slugify(e.title)}|${slugify(e.venue)}`;
}

const slot = (e: DedupeRow) => `${weekday(londonDateKey(e.startsAt))}@${formatTime(e.startsAt)}`;

/** True when `b` adds nothing because `a` already covers it. */
export function covers(a: DedupeRow, b: DedupeRow): boolean {
  if (sameEventKey(a) !== sameEventKey(b)) return false;
  if (a.repeatsWeekly) {
    // A weekly session covers a one-off or weekly listing on the same weekday and time.
    return slot(a) === slot(b) && (b.repeatsWeekly || londonDateKey(b.startsAt) >= londonDateKey(a.startsAt));
  }
  if (b.repeatsWeekly) return false;
  // Two one-off listings whose days overlap.
  const [aStart, aEnd, bStart, bEnd] = [a.startsAt, a.endsAt, b.startsAt, b.endsAt].map(londonDateKey);
  return aStart <= bEnd && bStart <= aEnd;
}

/** Which copy to keep: featured, then live, then owner-supplied, then the one covering the most days. */
function rank(e: DedupeRow, now: Date): number[] {
  return [
    e.featuredUntil && e.featuredUntil > now ? 0 : 1,
    e.status === "pending" ? 1 : 0,
    e.origin === "curated" ? 0 : 1,
    e.repeatsWeekly ? 0 : 1,
    -(e.endsAt.getTime() - e.startsAt.getTime()),
    e.createdAt?.getTime() ?? 0,
    e.id,
  ];
}

function compare(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

/** Ids of rows that duplicate a better copy. */
export function findDuplicates(rows: DedupeRow[], now = new Date()): number[] {
  const kept: DedupeRow[] = [];
  const drop: number[] = [];
  for (const r of [...rows].sort((a, b) => compare(rank(a, now), rank(b, now)))) {
    if (kept.some((k) => covers(k, r))) drop.push(r.id);
    else kept.push(r);
  }
  return drop;
}
