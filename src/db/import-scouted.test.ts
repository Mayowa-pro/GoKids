import { describe, expect, it } from "vitest";
import { scoutedEventSchema } from "@/lib/validation";

const ok = {
  title: "Half-term Family Trail", description: "Follow the trail round the galleries and collect stickers.", category: "Museums",
  area: "hanley", venue: "Potteries Museum & Art Gallery", postcode: "st13dw", date: "2026-10-27", start: "10:00", end: "16:00",
  isFree: true, minAge: 4, maxAge: 11, organiser: "Potteries Museum", sourceUrl: "https://example.org/trail",
};

describe("scoutedEventSchema", () => {
  it("accepts a well-formed scouted event", () => {
    const r = scoutedEventSchema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.postcode).toBe("ST1 3DW");
  });
  it("requires a source link and a known area", () => {
    expect(scoutedEventSchema.safeParse({ ...ok, sourceUrl: undefined }).success).toBe(false);
    expect(scoutedEventSchema.safeParse({ ...ok, area: "london" }).success).toBe(false);
  });
  it("rejects coordinates outside the Midlands", () => {
    expect(scoutedEventSchema.safeParse({ ...ok, lat: 51.5, lng: -0.12 }).success).toBe(false);
  });
});
