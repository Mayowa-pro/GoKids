"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { PublicEvent } from "@/db/queries";
import { distanceKm, formatMiles, type LatLng } from "@/lib/geo";
import type { Area } from "@/lib/site";
import { formatDayHeading, londonDateKey } from "@/lib/time";
import { EventTile } from "./EventTile";

const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted">Loading map…</div>,
});

type Props = {
  heading: string;
  events: PublicEvent[];
  areas: Area[];
  near?: string;
  center: LatLng;
  zoom: number;
  todayKey: string;
};

export function EventsExplorer({ heading, events, areas, near, center, zoom, todayKey }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [myLocation, setMyLocation] = useState<LatLng | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  const nearArea = areas.find((a) => a.slug === near);
  const origin = useMemo<LatLng | null>(
    () => myLocation ?? (nearArea ? { lat: nearArea.lat, lng: nearArea.lng } : null),
    [myLocation, nearArea],
  );
  const originName = myLocation ? "you" : nearArea?.name;
  const areaName = (slug: string) => areas.find((a) => a.slug === slug)?.name ?? slug;

  const days = useMemo(() => {
    const groups = new Map<string, PublicEvent[]>();
    for (const e of events) {
      // Events that started earlier (like a week-long trail) show under today.
      const startKey = londonDateKey(e.startsAt);
      const k = startKey < todayKey ? todayKey : startKey;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(e);
    }
    for (const list of groups.values()) {
      list.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          a.startsAt.getTime() - b.startsAt.getTime() ||
          (origin ? distanceKm(origin, a) - distanceKm(origin, b) : 0),
      );
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [events, origin, todayKey]);

  function locate() {
    setLocError(null);
    if (!("geolocation" in navigator)) return setLocError("Your browser can't share your location.");
    navigator.geolocation.getCurrentPosition(
      (p) => setMyLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLocError("Location was blocked. Pick an area from the list instead."),
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }

  const freeCount = events.filter((e) => e.isFree).length;
  const hasSamples = events.some((e) => e.isSample);

  return (
    <>
      {hasSamples && (
        <p role="note" className="mb-4 rounded-xl border-2 border-dashed border-paid bg-paid-soft px-4 py-3 text-sm text-ink">
          <strong>Preview:</strong> events marked &ldquo;Sample&rdquo; are examples to show how the site works. They are not real, so please
          don&apos;t plan a day out around them.
        </p>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="mr-auto font-display text-2xl font-bold leading-tight">{heading}</h2>
        <div className="flex gap-1.5 lg:hidden" role="group" aria-label="Show as">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className="min-h-11 rounded-2xl bg-cobalt-soft px-4 font-semibold aria-pressed:bg-cobalt aria-pressed:text-surface"
            >
              {v === "list" ? "Ideas" : "Map"}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-muted">
          {events.length} idea{events.length === 1 ? "" : "s"} · {freeCount} free
        </span>
        <button type="button" onClick={locate} className="min-h-10 rounded-2xl bg-cobalt-soft px-3.5 font-semibold text-cobalt">
          {myLocation ? "Using your location" : "Use my location"}
        </button>
        {locError && <span className="text-danger">{locError}</span>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className={`${view === "map" ? "hidden lg:flex" : "flex"} min-w-0 flex-col gap-6`} aria-live="polite">
          {days.length === 0 && (
            <div className="rounded-tile bg-cobalt-soft p-8 text-center text-muted">
              <strong className="text-ink">Nothing on for that choice.</strong>
              <br />
              Try another day, &ldquo;Next 7 days&rdquo;, another age group, or switch off &ldquo;Free only&rdquo;.
            </div>
          )}
          {days.map(([key, list]) => {
            const h = formatDayHeading(key, todayKey);
            return (
              <section key={key}>
                {days.length > 1 && (
                  <h3 className="mb-2.5 flex items-baseline gap-2.5 font-display text-lg font-semibold">
                    {h.label}
                    <span className="font-sans text-[13px] font-medium text-muted">{h.date}</span>
                  </h3>
                )}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {list.map((e) => (
                    <EventTile
                      key={e.id}
                      event={e}
                      areaName={areaName(e.area)}
                      distance={origin ? `${formatMiles(distanceKm(origin, e))} from ${originName}` : undefined}
                      highlighted={hovered === e.id}
                      onHover={setHovered}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className={`${view === "list" ? "hidden lg:block" : "block"} lg:sticky lg:top-20`}>
          <div className="h-[65vh] overflow-hidden rounded-tile bg-cobalt-soft p-2 lg:h-[calc(100vh-7rem)]">
            <EventMap events={events} center={center} zoom={zoom} origin={origin} highlighted={hovered} onHover={setHovered} />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 px-1 text-xs text-muted">
            <span className="flex items-center gap-1.5"><i className="inline-block size-2.5 rounded-full bg-yolk" />Free</span>
            <span className="flex items-center gap-1.5"><i className="inline-block size-2.5 rounded-full bg-paid" />Paid</span>
            <span className="flex items-center gap-1.5"><i className="inline-block size-3 rounded-full border-[3px] border-cobalt" />Featured</span>
          </div>
        </aside>
      </div>
    </>
  );
}
