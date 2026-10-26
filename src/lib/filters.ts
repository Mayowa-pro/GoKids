import { addDays, londonDateKey, londonMidnight, weekday } from "./time";

export const WHEN_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This weekend" },
  { value: "week", label: "Next 7 days" },
  { value: "all", label: "Everything" },
] as const;
/** "date" means one chosen day, picked from the day strip. */
export type When = (typeof WHEN_OPTIONS)[number]["value"] | "date";

export const AGE_OPTIONS = [
  { value: "all", label: "Everyone", min: 0, max: 99 },
  { value: "0-4", label: "Under 5s", min: 0, max: 4 },
  { value: "5-11", label: "5 to 11", min: 5, max: 11 },
  { value: "12+", label: "12 and over", min: 12, max: 99 },
] as const;
export type AgeBand = (typeof AGE_OPTIONS)[number]["value"];

export type EventFilters = {
  when: When;
  age: AgeBand;
  free: boolean;
  /** Most a parent wants to pay, in pounds (cheapest ticket). */
  max?: number;
  q: string;
  near?: string;
  /** "YYYY-MM-DD", only when `when` is "date". */
  date?: string;
};

/** The page opens on today's ideas, like a "what shall we do today?" planner. */
export const DEFAULT_WHEN: When = "today";

/** How many days ahead the day strip offers. */
export const DAY_STRIP_DAYS = 14;

type RawParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseFilters(params: RawParams, now = new Date()): EventFilters {
  const when = first(params.when);
  const age = first(params.age);
  const day = first(params.day);
  const today = londonDateKey(now);
  const date = day && /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= today && day <= addDays(today, 366) ? day : undefined;
  return {
    when: date ? "date" : WHEN_OPTIONS.some((o) => o.value === when) ? (when as When) : DEFAULT_WHEN,
    date,
    age: AGE_OPTIONS.some((o) => o.value === age) ? (age as AgeBand) : "all",
    free: first(params.free) === "1",
    max: parseMax(first(params.max)),
    q: (first(params.q) ?? "").trim().slice(0, 80),
    near: first(params.near) || undefined,
  };
}

/** The [from, to) window of instants a "when" filter covers, in UK days. */
export function dateWindow(when: When, now: Date, date?: string): { from: Date; to: Date } {
  const today = londonDateKey(now);
  const day = (k: string) => londonMidnight(k);
  switch (when) {
    case "date": {
      const d = date ?? today;
      return { from: d === today ? now : day(d), to: day(addDays(d, 1)) };
    }
    case "today":
      return { from: now, to: day(addDays(today, 1)) };
    case "tomorrow":
      return { from: day(addDays(today, 1)), to: day(addDays(today, 2)) };
    case "weekend": {
      const dow = weekday(today);
      if (dow === 0) return { from: now, to: day(addDays(today, 1)) };
      const sat = addDays(today, dow === 6 ? 0 : 6 - dow);
      return { from: dow === 6 ? now : day(sat), to: day(addDays(sat, 2)) };
    }
    case "week":
      return { from: now, to: day(addDays(today, 8)) };
    case "all":
      return { from: now, to: day(addDays(today, 366)) };
  }
}

export function ageRange(age: AgeBand): { min: number; max: number } {
  const o = AGE_OPTIONS.find((a) => a.value === age)!;
  return { min: o.min, max: o.max };
}

/** Highest amount on the budget slider; the far end means "any price". */
export const BUDGET_SLIDER_MAX = 50;

/** A whole-pound budget between £1 and £49 from the address, or undefined. */
function parseMax(v: string | undefined): number | undefined {
  if (!v || !/^\d{1,2}$/.test(v)) return undefined;
  const n = Number(v);
  return n >= 1 && n < BUDGET_SLIDER_MAX ? n : undefined;
}

/** Build a query string, dropping defaults so URLs stay short and shareable. */
export function toSearch(f: Partial<EventFilters>): string {
  const p = new URLSearchParams();
  if (f.when === "date" && f.date) p.set("day", f.date);
  else if (f.when && f.when !== DEFAULT_WHEN && f.when !== "date") p.set("when", f.when);
  if (f.age && f.age !== "all") p.set("age", f.age);
  if (f.free) p.set("free", "1");
  else if (f.max) p.set("max", String(f.max));
  if (f.q) p.set("q", f.q);
  if (f.near) p.set("near", f.near);
  const s = p.toString();
  return s ? `?${s}` : "";
}
