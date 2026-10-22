/**
 * The cheapest price mentioned in an event's price wording, in pence, so parents can filter by budget.
 * "£9.50 child, £12.50 adult" → 950. Wording with no £ amount ("See website") gives null (price unknown).
 */
export function priceFromText(isFree: boolean, text: string | null | undefined): number | null {
  if (isFree) return 0;
  const amounts = [...(text ?? "").matchAll(/£\s?(\d+(?:\.\d{1,2})?)/g)].map((m) => Math.round(Number(m[1]) * 100));
  return amounts.length ? Math.min(...amounts) : null;
}

export const BUDGET_OPTIONS = [
  { value: "", label: "Any price" },
  { value: "free", label: "Free only" },
  { value: "5", label: "Up to £5" },
  { value: "10", label: "Up to £10" },
  { value: "20", label: "Up to £20" },
] as const;
