import { describe, expect, it } from "vitest";
import { nextOccurrence, repeatLabel } from "./recurrence";

// Monday 19 Oct 2026, 10:30–11:00 BST
const series = {
  startsAt: new Date("2026-10-19T09:30:00Z"),
  endsAt: new Date("2026-10-19T10:00:00Z"),
  repeatsWeekly: true,
  repeatUntil: null as Date | null,
};

describe("nextOccurrence", () => {
  it("returns the next Monday once this week's session has finished", () => {
    const n = nextOccurrence(series, new Date("2026-10-20T12:00:00Z"))!;
    // Clocks go back on 25 Oct, so 10:30 GMT is 10:30Z.
    expect(n.startsAt.toISOString()).toBe("2026-10-26T10:30:00.000Z");
    expect(n.endsAt.toISOString()).toBe("2026-10-26T11:00:00.000Z");
  });

  it("keeps a session that is still running", () => {
    const n = nextOccurrence(series, new Date("2026-10-19T09:45:00Z"))!;
    expect(n.startsAt.toISOString()).toBe("2026-10-19T09:30:00.000Z");
  });

  it("skips many weeks ahead correctly", () => {
    const n = nextOccurrence(series, new Date("2027-03-03T12:00:00Z"))!;
    expect(n.startsAt.toISOString()).toBe("2027-03-08T10:30:00.000Z"); // Monday, still GMT
  });

  it("stops after repeatUntil", () => {
    expect(nextOccurrence({ ...series, repeatUntil: new Date("2026-10-27T00:00:00Z") }, new Date("2026-10-28T00:00:00Z"))).toBeNull();
  });

  it("leaves one-off events alone", () => {
    const once = { ...series, repeatsWeekly: false };
    expect(nextOccurrence(once, new Date("2026-10-19T08:00:00Z"))).toBe(once);
    expect(nextOccurrence(once, new Date("2026-10-20T08:00:00Z"))).toBeNull();
  });

  it("labels the day", () => {
    expect(repeatLabel(series)).toBe("Every Monday");
  });
});
