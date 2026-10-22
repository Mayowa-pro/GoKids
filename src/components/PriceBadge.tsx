export function PriceBadge({ isFree, priceText, small }: { isFree: boolean; priceText: string | null; small?: boolean }) {
  const size = small ? "px-2 py-0.5 text-[12.5px]" : "px-2.5 py-1 text-[13px]";
  return isFree ? (
    <span className={`whitespace-nowrap rounded-xl bg-yolk font-bold text-yolk-ink ${size}`}>Free</span>
  ) : (
    <span
      className={`rounded-xl font-bold text-paid ${small ? "max-w-[13ch] truncate bg-surface" : "bg-paid-soft"} ${size}`}
      title={priceText ?? "Paid"}
    >
      {priceText ?? "Paid"}
    </span>
  );
}
