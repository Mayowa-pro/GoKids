import { describe, expect, it } from "vitest";
import { dateWindow, parseFilters, toSearch } from "./filters";

describe("parseFilters", () => {
  it("falls back to safe defaults for junk input", () => {
    expect(parseFilters({ when: "never", age: "99", free: "yes" })).toEqual({ when: "week", age: "all", free: false, q: "", near: undefined });
  });

  it("reads valid values and trims search", () => {
    expect(parseFilters({ when: "weekend", age: "0-4", free: "1", q: "  messy play ", near: "hanley" })).toEqual({
      when: "weekend", age: "0-4", free: true, q: "messy play", near: "hanley",
    });
  });

  it("round-trips through the URL and drops defaults", () => {
    expect(toSearch({ when: "week", age: "all" })).toBe("");
    const s = toSearch({ when: "today", free: true, q: "lego" });
    expect(parseFilters(Object.fromEntries(new URLSearchParams(s)))).toMatchObject({ when: "today", free: true, q: "lego" });
  });
});

describe("dateWindow", () => {
  const tuesday = new Date("2026-10-20T10:00:00Z"); // 11:00 BST

  it("'today' runs from now to London midnight", () => {
    const w = dateWindow("today", tuesday);
    expect(w.from).toEqual(tuesday);
    expect(w.to.toISOString()).toBe("2026-10-20T23:00:00.000Z");
  });

  it("'this weekend' on a weekday covers Saturday and Sunday", () => {
    const w = dateWindow("weekend", tuesday);
    expect(w.from.toISOString()).toBe("2026-10-23T23:00:00.000Z"); // Sat 24 Oct, 00:00 BST
    expect(w.to.toISOString()).toBe("2026-10-26T00:00:00.000Z"); // Mon 26 Oct, 00:00 GMT
  });

  it("'this weekend' on a Sunday is just the rest of Sunday", () => {
    const sunday = new Date("2026-10-25T13:00:00Z");
    const w = dateWindow("weekend", sunday);
    expect(w.from).toEqual(sunday);
    expect(w.to.toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });
});
