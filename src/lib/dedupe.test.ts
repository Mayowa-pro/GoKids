import { describe, expect, it } from "vitest";
import { covers, findDuplicates, type DedupeRow } from "./dedupe";
import { londonMidnight } from "./time";

const at = (d: string, h: number) => new Date(londonMidnight(d).getTime() + h * 3600_000);
let id = 0;
const row = (o: Partial<DedupeRow> & { date: string; end?: string }): DedupeRow => ({
  id: ++id, title: "Lego Club", venue: "Longton Library", startsAt: at(o.date, 15.5), endsAt: at(o.end ?? o.date, 16.5),
  repeatsWeekly: false, status: "approved", ...o,
});

describe("duplicate listings", () => {
  it("treats the same event at the same place and day as a copy, ignoring punctuation", () => {
    expect(covers(row({ date: "2026-10-24" }), row({ date: "2026-10-24", title: "LEGO club!" }))).toBe(true);
    expect(covers(row({ date: "2026-10-24" }), row({ date: "2026-10-24", venue: "Meir Library" }))).toBe(false);
    expect(covers(row({ date: "2026-10-24" }), row({ date: "2026-10-26" }))).toBe(false);
  });

  it("drops a one-day listing that a multi-day listing already covers, keeping the longer one", () => {
    const day = row({ date: "2026-10-25" });
    const run = row({ date: "2026-10-24", end: "2026-11-01" });
    expect(findDuplicates([day, run])).toEqual([day.id]);
  });

  it("drops a one-off that a weekly session already covers", () => {
    const weekly = row({ date: "2026-10-19", repeatsWeekly: true });
    const oneOff = row({ date: "2026-10-26" });
    expect(findDuplicates([oneOff, weekly])).toEqual([oneOff.id]);
    expect(findDuplicates([weekly, row({ date: "2026-10-27" })])).toEqual([]);
  });

  it("keeps the live copy over one waiting for approval", () => {
    const pending = row({ date: "2026-10-24", status: "pending" });
    const live = row({ date: "2026-10-24" });
    expect(findDuplicates([pending, live])).toEqual([pending.id]);
  });
});
