import Link from "next/link";
import type { PublicEvent } from "@/db/queries";
import { repeatLabel } from "@/lib/recurrence";
import { formatShortDate, formatTime, isMultiDay } from "@/lib/time";
import { PriceBadge } from "./PriceBadge";

type Props = {
  event: PublicEvent;
  areaName: string;
  distance?: string;
  highlighted?: boolean;
  onHover?: (id: number | null) => void;
};

export function EventCard({ event: e, areaName, distance, highlighted, onHover }: Props) {
  return (
    <Link
      href={`/events/${e.slug}`}
      onMouseEnter={() => onHover?.(e.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(e.id)}
      onBlur={() => onHover?.(null)}
      className={[
        "grid grid-cols-[56px_minmax(0,1fr)] gap-x-3.5 gap-y-2 rounded-2xl border bg-surface p-3.5 transition-colors sm:grid-cols-[64px_minmax(0,1fr)_auto]",
        e.featured ? "border-2 border-cobalt bg-gradient-to-b from-cobalt-soft to-surface to-70%" : "border-line",
        highlighted ? "border-cobalt" : "hover:border-cobalt",
      ].join(" ")}
    >
      <div className="font-bold leading-tight tabular-nums">
        {isMultiDay(e) ? "Daily" : formatTime(e.startsAt)}
        <span className="block text-xs font-medium text-muted">
          {isMultiDay(e) ? `until ${formatShortDate(e.endsAt)}` : e.timesNote ? "" : `to ${formatTime(e.endsAt)}`}
        </span>
      </div>
      <div className="min-w-0">
        {e.featured && <div className="label !text-cobalt mb-1 !text-[11px]">★ Featured</div>}
        <h3 className="text-base font-bold leading-snug">{e.title}</h3>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[13.5px] text-muted">
          <span>
            {e.venue}, {areaName}
          </span>
          {distance && <span>{distance}</span>}
        </div>
        {e.timesNote && <p className="mt-0.5 text-[13.5px] font-medium">{e.timesNote}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
          {e.repeatsWeekly && (
            <span className="rounded-md border border-cobalt bg-cobalt-soft px-2 py-0.5 text-cobalt">{repeatLabel(e)}</span>
          )}
          {e.isSample && <span className="rounded-md border border-dashed border-paid px-2 py-0.5 text-paid">Sample</span>}
          <span className="rounded-md border border-line bg-bg px-2 py-0.5">{e.category}</span>
          <span className="rounded-md border border-line bg-bg px-2 py-0.5">
            Ages {e.minAge}–{e.maxAge}
          </span>
        </div>
      </div>
      <div className="col-start-2 sm:col-start-3 sm:row-start-1">
        <PriceBadge isFree={e.isFree} priceText={e.priceText} />
      </div>
    </Link>
  );
}
