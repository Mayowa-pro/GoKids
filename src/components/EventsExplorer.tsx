"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { PublicEvent } from "@/db/queries";
import { distanceKm, formatMiles, type LatLng } from "@/lib/geo";
import { findPostcode } from "@/lib/postcode";
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
  const [myLocation, setMyLocation] = useState<{ point: LatLng; label: string } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [postcode, setPostcode] = useState("");
  const [busy, setBusy] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "day">("distance");

  // Remember the parent's postcode on this device (only a convenience, so failures are ignored).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("gokids-location") ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved?.point && saved?.label) setMyLocation(saved);
    } catch {}
  }, []);
  function remember(loc: { point: LatLng; label: string } | null) {
    setMyLocation(loc);
    setSortBy("distance");
    try {
      if (loc) localStorage.setItem("gokids-location", JSON.stringify(loc));
      else localStorage.removeItem("gokids-location");
    } catch {}
  }

  const nearArea = areas.find((a) => a.slug === near);
  const origin = useMemo<LatLng | null>(
    () => myLocation?.point ?? (nearArea ? { lat: nearArea.lat, lng: nearArea.lng } : null),
    [myLocation, nearArea],
  );
  const originName = myLocation ? "you" : nearArea?.name;
  const areaName = (slug: string) => areas.find((a) => a.slug === slug)?.name ?? slug;
  const byDistance = !!origin && sortBy === "distance";

  const days = useMemo(() => {
    if (byDistance && origin) {
      const sorted = [...events].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b));
      return [["nearest", sorted]] as [string, PublicEvent[]][];
    }
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
  }, [events, origin, todayKey, byDistance]);

  /** The closest few, for the map to zoom to and highlight. */
  const nearestIds = useMemo(
    () => (origin ? [...events].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b)).slice(0, 3).map((e) => e.id) : []),
    [events, origin],
  );

  function locate() {
    setLocError(null);
    if (!("geolocation" in navigator)) return setLocError("Your browser can't share your location. Type your postcode instead.");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBusy(false);
        remember({ point: { lat: p.coords.latitude, lng: p.coords.longitude }, label: "your location" });
      },
      () => {
        setBusy(false);
        setLocError("Location was blocked. Type your postcode instead.");
      },
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }

  async function lookUp(ev: React.FormEvent) {
    ev.preventDefault();
    setLocError(null);
    if (!postcode.trim()) return;
    setBusy(true);
    const found = await findPostcode(postcode);
    setBusy(false);
    if (!found) return setLocError("We couldn't find that postcode. Check it and try again, for example ST4 2RR.");
    remember(found);
    setPostcode("");
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
      <section aria-labelledby="near-me" className="mb-6 rounded-tile bg-[var(--tile-2)] p-4 sm:p-5">
        <h2 id="near-me" className="font-display text-xl font-bold">
          {myLocation ? `Showing what's nearest to ${myLocation.label}` : "Find events near you"}
        </h2>
        {myLocation ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[15px]">Closest first, with how far each one is.</span>
            <button type="button" onClick={() => remember(null)} className="min-h-11 rounded-2xl bg-surface px-4 font-semibold text-cobalt">
              Change location
            </button>
          </div>
        ) : (
          <form onSubmit={lookUp} className="mt-2.5 flex flex-wrap items-center gap-2">
            <label className="flex min-h-11 min-w-0 flex-[1_1_180px] items-center rounded-2xl bg-surface px-3.5">
              <span className="sr-only">Your postcode</span>
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Your postcode, e.g. ST4 2RR"
                autoComplete="postal-code"
                className="w-full min-w-0 bg-transparent py-2.5 uppercase outline-none placeholder:normal-case"
              />
            </label>
            <button type="submit" disabled={busy} className="min-h-11 rounded-2xl bg-cobalt px-5 font-semibold text-white disabled:opacity-60">
              {busy ? "Finding…" : "Find"}
            </button>
            <span className="text-sm font-semibold">or</span>
            <button type="button" onClick={locate} disabled={busy} className="flex min-h-11 items-center gap-1.5 rounded-2xl bg-surface px-4 font-semibold text-cobalt disabled:opacity-60">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
              Use my location
            </button>
          </form>
        )}
        {locError && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{locError}</p>}
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="mr-auto font-display text-2xl font-bold leading-tight">{heading}</h2>
        <div className={`flex gap-1.5 lg:hidden ${origin ? "hidden" : ""}`} role="group" aria-label="Show as">
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
        {origin && (
          <div className="flex gap-1.5" role="group" aria-label="Order">
            {(
              [
                ["distance", "Nearest first"],
                ["day", "By day"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={sortBy === v}
                onClick={() => setSortBy(v)}
                className="min-h-10 rounded-2xl bg-cobalt-soft px-3.5 font-semibold aria-pressed:bg-cobalt aria-pressed:text-surface"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`grid items-start gap-6 ${origin ? "" : "lg:grid-cols-[minmax(0,1fr)_420px]"}`}>
        <div className={`${view === "map" && !origin ? "hidden lg:flex" : "flex"} min-w-0 flex-col gap-6`} aria-live="polite">
          {days.length === 0 && (
            <div className="rounded-tile bg-cobalt-soft p-8 text-center text-muted">
              <strong className="text-ink">Nothing on for that choice.</strong>
              <br />
              Try another day, &ldquo;Next 7 days&rdquo;, another age group, or switch off &ldquo;Free only&rdquo;.
            </div>
          )}
          {days.map(([key, list]) => {
            const h = key === "nearest" ? null : formatDayHeading(key, todayKey);
            return (
              <section key={key}>
                {h && days.length > 1 && (
                  <h3 className="mb-2.5 flex items-baseline gap-2.5 font-display text-lg font-semibold">
                    {h.label}
                    <span className="font-sans text-[13px] font-medium text-muted">{h.date}</span>
                  </h3>
                )}
                <div className={`grid grid-cols-2 gap-3 md:grid-cols-3 ${origin ? "lg:grid-cols-4" : "lg:grid-cols-2 xl:grid-cols-3"}`}>
                  {list.map((e) => (
                    <EventTile
                      key={e.id}
                      event={e}
                      areaName={areaName(e.area)}
                      distance={origin ? `${formatMiles(distanceKm(origin, e))} from ${originName}` : undefined}
                      showDay={byDistance}
                      highlighted={hovered === e.id}
                      onHover={setHovered}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* With a location set, the map goes across the top so parents see where they are first. */}
        <aside className={origin ? "order-first" : `${view === "list" ? "hidden lg:block" : "block"} lg:sticky lg:top-20`}>
          <div className={`${origin ? "h-72 sm:h-96" : "h-[65vh] lg:h-[calc(100vh-7rem)]"} overflow-hidden rounded-tile bg-cobalt-soft p-2`}>
            <EventMap
              events={events}
              center={center}
              zoom={zoom}
              origin={origin}
              nearestIds={nearestIds}
              highlighted={hovered}
              onHover={setHovered}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 px-1 text-xs text-muted">
            <span className="flex items-center gap-1.5"><i className="inline-block size-2.5 rounded-full bg-yolk" />Free</span>
            <span className="flex items-center gap-1.5"><i className="inline-block size-2.5 rounded-full bg-paid" />Paid</span>
            <span className="flex items-center gap-1.5"><i className="inline-block size-3 rounded-full border-[3px] border-cobalt" />Featured</span>
            {origin && <span className="flex items-center gap-1.5"><i className="inline-block size-3 rounded-full bg-coral ring-2 ring-surface" />You</span>}
          </div>
        </aside>
      </div>
    </>
  );
}
