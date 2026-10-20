import { describe, expect, it } from "vitest";
import { validateSubmission } from "./validation";

const good = {
  title: "Lego Club", description: "A new building challenge every week. All bricks provided.", category: "STEM",
  area: "longton", venue: "Longton Library", postcode: "st32rq", date: "2026-11-02", start: "15:45", end: "16:45",
  isFree: "yes", priceText: "", minAge: "5", maxAge: "11", organiser: "Stoke Libraries", contactEmail: "kids@example.org", bookingUrl: "",
};

describe("validateSubmission", () => {
  it("accepts a good free event and tidies the postcode", () => {
    const r = validateSubmission(good);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.postcode).toBe("ST3 2RQ");
      expect(r.data.isFree).toBe(true);
      expect(r.data.minAge).toBe(5);
    }
  });

  it("needs a price for paid events", () => {
    const r = validateSubmission({ ...good, isFree: "no" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.priceText).toMatch(/price/i);
  });

  it("rejects end before start, bad postcodes, unknown towns and non-https links", () => {
    const r = validateSubmission({ ...good, end: "15:00", postcode: "NOPE", area: "narnia", bookingUrl: "javascript:alert(1)" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(["area", "bookingUrl", "end", "postcode"].sort());
    }
  });
});
