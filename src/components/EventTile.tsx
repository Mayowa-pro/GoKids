import Link from "next/link";
import type { PublicEvent } from "@/db/queries";
import { repeatLabel } from "@/lib/recurrence";
import { formatDayShort, formatShortDate, formatTime, isMultiDay } from "@/lib/time";
import { PriceBadge } from "./PriceBadge";

const TILE_COLOURS = ["bg-[var(--tile-1)]", "bg-[var(--tile-2)]", "bg-[var(--tile-3)]", "bg-[var(--tile-4)]", "bg-[var(--tile-5)]"];

/** Each event keeps the same colour everywhere, and neighbours usually differ. */
export function tileColour(id: number) {
  return TILE_COLOURS[id % TILE_COLOURS.length];
}

type Props = {
  event: PublicEvent;
  areaName: string;
  distance?: string;
  highlighted?: boolean;
  onHover?: (id: number | null) => void;
};

export function EventTile({ event: e, areaName, distance, highlighted, onHover }: Props) {
  const when = isMultiDay(e) ? `Daily to ${formatShortDate(e.endsAt)}` : formatTime(e.startsAt);
  return (
    <Link
      href={`/events/${e.slug}`}
      onMouseEnter={() => onHover?.(e.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(e.id)}
      onBlur={() => onHover?.(null)}
      className={[
        "flex min-h-[200px] flex-col justify-between gap-3 rounded-tile p-3.5 text-ink transition-transform hover:-translate-y-0.5",
        tileColour(e.id),
        e.featured || highlighted ? "outline outline-[3px] outline-offset-0 outline-cobalt" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-1.5">
        <span className="rounded-xl bg-surface px-2.5 py-1 text-[13px] font-bold tabular-nums">{when}</span>
        <PriceBadge isFree={e.isFree} priceText={e.priceText} small />
      </div>
      <div className="flex flex-col gap-1">
        {e.featured && <span className="text-xs font-bold uppercase tracking-wider text-cobalt">★ Featured</span>}
        <h3 className="font-display text-[19px] font-semibold leading-[1.15]">{e.title}</h3>
        <p className="text-[13.5px] leading-snug">
          {e.venue}, {areaName}
          {distance && <span className="block font-semibold">{distance}</span>}
        </p>
        {e.timesNote && <p className="text-[13px] font-semibold leading-snug">{e.timesNote}</p>}
        {e.alsoOn?.length ? <p className="text-[13px] font-semibold leading-snug">Also on {e.alsoOn.map(formatDayShort).join(", ")}</p> : null}
        <div className="mt-1 flex flex-wrap gap-1 text-[12px] font-bold">
          {e.repeatsWeekly && <span className="rounded-lg bg-surface/70 px-2 py-0.5">{repeatLabel(e)}</span>}
          <span className="rounded-lg bg-surface/70 px-2 py-0.5">Ages {e.minAge}–{e.maxAge}</span>
          {e.isSample && <span className="rounded-lg border border-dashed border-paid px-2 py-0.5 text-paid">Sample</span>}
        </div>
      </div>
    </Link>
  );
}
