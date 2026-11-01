import { placesIn } from "@/lib/places";
import type { Area } from "@/lib/site";

const COLOURS = ["bg-[var(--tile-2)]", "bg-[var(--tile-4)]", "bg-[var(--tile-1)]", "bg-[var(--tile-3)]", "bg-[var(--tile-5)]"];

/** Parks and museums that are open most days, so a quiet day still has ideas. */
export function GoodAnyDay({ region, areas, prominent, freeOnly }: { region: string; areas: Area[]; prominent?: boolean; freeOnly?: boolean }) {
  const places = placesIn(region).filter((p) => p.free || !freeOnly);
  if (!places.length) return null;
  const areaName = (slug: string) => areas.find((a) => a.slug === slug)?.name ?? slug;
  return (
    <section aria-labelledby="any-day" className={prominent ? "mt-6" : "mt-10"}>
      <h2 id="any-day" className="font-display text-2xl font-bold">Good any day</h2>
      <p className="mb-3 text-[15px] text-muted">Parks and museums you can go to without booking.</p>
      <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {places.map((p, i) => (
          <li key={p.name} className={`flex w-[78%] shrink-0 snap-start flex-col gap-2 rounded-tile p-4 md:w-auto ${COLOURS[i % COLOURS.length]}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              {p.free ? (
                <span className="rounded-xl bg-yolk px-2 py-0.5 text-[12.5px] font-bold text-yolk-ink">Free</span>
              ) : (
                <span className="rounded-xl bg-surface px-2 py-0.5 text-[12.5px] font-bold leading-snug text-paid">{p.price}</span>
              )}
              <span className="text-[13px] font-semibold">{areaName(p.area)}</span>
            </div>
            <h3 className="font-display text-[19px] font-semibold leading-tight">{p.name}</h3>
            <p className="text-[14px] leading-snug">{p.what}</p>
            <p className="text-[13px] font-semibold leading-snug">{p.when}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-1 text-sm font-semibold">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.postcode ?? "Stoke-on-Trent"}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-10 items-center rounded-xl bg-surface px-3 text-cobalt"
              >
                Directions
              </a>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center rounded-xl bg-surface/60 px-3 text-cobalt">
                More info
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
