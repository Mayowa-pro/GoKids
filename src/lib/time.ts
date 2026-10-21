/** All event times are shown and grouped in UK time, whatever the server's timezone. */
export const TZ = "Europe/London";

/** Minutes that London is ahead of UTC at a given instant (0 in winter, 60 in summer). */
export function londonOffsetMinutes(at: Date): number {
  const part = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, timeZoneName: "shortOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = part.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

/** "2026-10-20" for the London calendar day containing `at`. */
export function londonDateKey(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

/** UTC instant of London midnight for a "YYYY-MM-DD" key. */
export function londonMidnight(dateKey: string): Date {
  const [y, mo, d] = dateKey.split("-").map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, d));
  const off = londonOffsetMinutes(guess);
  return new Date(guess.getTime() - off * 60_000);
}

export function addDays(dateKey: string, days: number): string {
  const [y, mo, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a date key. */
export function weekday(dateKey: string): number {
  const [y, mo, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}

export function formatTime(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(at);
}

export function formatDayHeading(dateKey: string, todayKey: string): { label: string; date: string } {
  const noon = new Date(londonMidnight(dateKey).getTime() + 12 * 3600_000);
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "long" }).format(noon);
  if (dateKey === todayKey) return { label: "Today", date };
  if (dateKey === addDays(todayKey, 1)) return { label: "Tomorrow", date };
  return { label: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long" }).format(noon), date };
}

export function formatLongDate(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(at);
}

export function formatShortDate(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short" }).format(at);
}

/** "Mon 26 Oct". */
export function formatDayShort(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" }).format(at);
}

/** True for events that run over several days, like a half-term trail. */
export function isMultiDay(e: { startsAt: Date; endsAt: Date }): boolean {
  return londonDateKey(e.startsAt) !== londonDateKey(e.endsAt);
}
