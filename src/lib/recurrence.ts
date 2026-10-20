import { addDays, londonDateKey, londonMidnight, weekday } from "./time";

type Timed = { startsAt: Date; endsAt: Date; repeatsWeekly: boolean; repeatUntil: Date | null };

/** Minutes after London midnight for an instant, e.g. 10:30 → 630. */
function londonMinutes(at: Date): number {
  const key = londonDateKey(at);
  return Math.round((at.getTime() - londonMidnight(key).getTime()) / 60_000);
}

/**
 * For a weekly event, the next session that hasn't finished by `after`.
 * Keeps the same UK wall-clock time across the clocks changing.
 * Returns null when the series has ended. One-off events are returned as they are.
 */
export function nextOccurrence<T extends Timed>(e: T, after: Date): T | null {
  if (!e.repeatsWeekly) return e.endsAt >= after ? e : null;
  const startKey = londonDateKey(e.startsAt);
  const startMin = londonMinutes(e.startsAt);
  const lengthMs = e.endsAt.getTime() - e.startsAt.getTime();

  const afterKey = londonDateKey(after);
  let weeks = 0;
  if (afterKey > startKey) {
    const days = Math.round((Date.parse(afterKey) - Date.parse(startKey)) / 86_400_000);
    weeks = Math.floor(days / 7);
  }
  for (let i = 0; i < 3; i++, weeks++) {
    const day = addDays(startKey, weeks * 7);
    const startsAt = new Date(londonMidnight(day).getTime() + startMin * 60_000);
    const endsAt = new Date(startsAt.getTime() + lengthMs);
    if (e.repeatUntil && startsAt > e.repeatUntil) return null;
    if (endsAt >= after) return { ...e, startsAt, endsAt };
  }
  return null;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Every Monday" for weekly events. */
export function repeatLabel(e: { startsAt: Date; repeatsWeekly: boolean }): string | null {
  return e.repeatsWeekly ? `Every ${DAY_NAMES[weekday(londonDateKey(e.startsAt))]}` : null;
}
