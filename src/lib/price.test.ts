import { describe, expect, it } from "vitest";
import { priceFromText } from "./price";

describe("priceFromText", () => {
  it("takes the cheapest amount, in pence", () => {
    expect(priceFromText(false, "£9.50 child, £12.50 adult")).toBe(950);
    expect(priceFromText(false, "£3 per child")).toBe(300);
    expect(priceFromText(false, "Adults £8, kids £ 4.5")).toBe(450);
  });
  it("is 0 for free events and unknown when there's no amount", () => {
    expect(priceFromText(true, null)).toBe(0);
    expect(priceFromText(false, "See website")).toBeNull();
    expect(priceFromText(false, "Included with museum entry")).toBeNull();
  });
});
