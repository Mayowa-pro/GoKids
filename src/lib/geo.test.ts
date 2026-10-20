import { describe, expect, it } from "vitest";
import { distanceKm, formatMiles } from "./geo";

describe("distance", () => {
  it("measures Tunstall to Longton at about 10km", () => {
    const d = distanceKm({ lat: 53.0595, lng: -2.212 }, { lat: 52.988, lng: -2.133 });
    expect(d).toBeGreaterThan(9);
    expect(d).toBeLessThan(10.5);
  });
  it("formats miles", () => {
    expect(formatMiles(1.609)).toBe("1.0 mi");
    expect(formatMiles(0.05)).toBe("under 0.1 mi");
  });
});
