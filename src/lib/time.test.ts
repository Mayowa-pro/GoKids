import { describe, expect, it } from "vitest";
import { addDays, formatTime, londonDateKey, londonMidnight, londonOffsetMinutes, weekday } from "./time";

describe("UK time helpers", () => {
  it("knows GMT in winter and BST in summer", () => {
    expect(londonOffsetMinutes(new Date("2026-01-15T12:00:00Z"))).toBe(0);
    expect(londonOffsetMinutes(new Date("2026-07-15T12:00:00Z"))).toBe(60);
  });

  it("finds London midnight on both sides of the clocks changing", () => {
    expect(londonMidnight("2026-07-01").toISOString()).toBe("2026-06-30T23:00:00.000Z");
    expect(londonMidnight("2026-12-01").toISOString()).toBe("2026-12-01T00:00:00.000Z");
    // Clocks go back at 02:00 BST on Sunday 25 October 2026: midnight that day is still BST.
    expect(londonMidnight("2026-10-25").toISOString()).toBe("2026-10-24T23:00:00.000Z");
    expect(londonMidnight("2026-10-26").toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });

  it("groups a late-evening UTC instant into the next London day in summer", () => {
    expect(londonDateKey(new Date("2026-06-10T23:30:00Z"))).toBe("2026-06-11");
  });

  it("formats times in UK time", () => {
    expect(formatTime(new Date("2026-06-10T09:30:00Z"))).toBe("10:30");
  });

  it("adds days across month ends and knows weekdays", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(weekday("2026-10-20")).toBe(2); // Tuesday
  });
});
