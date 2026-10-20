export function PriceBadge({ isFree, priceText }: { isFree: boolean; priceText: string | null }) {
  return isFree ? (
    <span className="whitespace-nowrap rounded-full bg-yolk px-2.5 py-1 text-[13px] font-bold text-yolk-ink">Free</span>
  ) : (
    <span className="whitespace-nowrap rounded-full bg-paid-soft px-2.5 py-1 text-[13px] font-bold text-paid">{priceText ?? "Paid"}</span>
  );
}
