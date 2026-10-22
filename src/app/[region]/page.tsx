import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { EventsExplorer } from "@/components/EventsExplorer";
import { tileColour } from "@/components/EventTile";
import { PlanPicker, SearchRow } from "@/components/PlanPicker";
import { listComingUp, listEvents } from "@/db/queries";
import { dateWindow, parseFilters, type EventFilters } from "@/lib/filters";
import { LIVE_REGIONS, getRegion, type Region } from "@/lib/site";
import { addDays, formatTime, londonDateKey, londonMidnight } from "@/lib/time";

export function generateStaticParams() {
  return LIVE_REGIONS.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[region]">): Promise<Metadata> {
  const region = getRegion((await params).region);
  if (!region) return {};
  return {
    title: `Things to do with kids in ${region.name}`,
    description: `Plan a family day out: free and paid kids' events across ${region.name}${region.areas.length ? `, including ${region.areas.map((a) => a.name).join(", ")}` : ""}.`,
    alternates: { canonical: `/${region.slug}` },
  };
}

const fmt = (key: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", ...o }).format(new Date(londonMidnight(key).getTime() + 12 * 3600_000));

function headingFor(f: EventFilters, todayKey: string) {
  switch (f.when) {
    case "today":
      return "Today's ideas";
    case "tomorrow":
      return "Tomorrow's ideas";
    case "weekend":
      return "Ideas for this weekend";
    case "all":
      return "Everything coming up";
    case "date":
      return f.date === addDays(todayKey, 1) ? "Tomorrow's ideas" : `Ideas for ${fmt(f.date!, { weekday: "long", day: "numeric", month: "long" })}`;
    default:
      return "Ideas for the next 7 days";
  }
}

function Hero({ region, children }: { region: Region; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-b-[32px] bg-hero text-hero-ink">
      <div aria-hidden="true" className="absolute -right-12 -top-12 size-44 rounded-full bg-coral" />
      <div aria-hidden="true" className="absolute right-24 top-20 size-10 rounded-full bg-yolk max-sm:right-20" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-7 pt-6">
        <h1 className="max-w-[16ch] font-display text-[34px] font-bold leading-[1.05] sm:text-5xl">Plan a fun day out in {region.name}</h1>
        {children}
      </div>
    </section>
  );
}

async function Results({ region, searchParams }: { region: Region; searchParams: PageProps<"/[region]">["searchParams"] }) {
  const raw = await searchParams;
  await connection();
  const now = new Date();
  const todayKey = londonDateKey(now);
  const filters = parseFilters(raw, now);
  const { to } = dateWindow(filters.when, now, filters.date);
  const [events, comingUp] = await Promise.all([
    listEvents(region.slug, filters, now),
    filters.when === "all" ? Promise.resolve([]) : listComingUp(region.slug, to, 4, now),
  ]);
  const areaName = (slug: string) => region.areas.find((a) => a.slug === slug)?.name ?? slug;

  return (
    <>
      <Hero region={region}>
        <PlanPicker filters={filters} todayKey={todayKey} />
      </Hero>
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="py-5">
          <SearchRow filters={filters} areas={region.areas} />
        </div>
        <EventsExplorer
          heading={headingFor(filters, todayKey)}
          events={events}
          areas={region.areas}
          near={filters.near}
          center={region.center}
          zoom={region.zoom}
          todayKey={todayKey}
        />

        {comingUp.length > 0 && (
          <section className="mt-10 rounded-tile bg-cobalt-soft p-4 sm:p-6">
            <h2 className="mb-3 font-display text-2xl font-bold">Coming up next</h2>
            <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {comingUp.map((e) => {
                const key = londonDateKey(e.startsAt);
                return (
                  <li key={e.id} className="min-w-0">
                    <Link href={`/events/${e.slug}`} className="flex items-center gap-3 rounded-[18px] bg-surface p-2.5 hover:outline hover:outline-2 hover:outline-cobalt">
                      <span className={`flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl leading-none ${tileColour(e.id)}`}>
                        <span className="text-xs font-semibold">{fmt(key, { weekday: "short" })}</span>
                        <span className="font-display text-xl font-bold">{fmt(key, { day: "numeric" })}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[17px] font-semibold leading-tight">{e.title}</span>
                        <span className="block truncate text-sm text-muted">
                          {formatTime(e.startsAt)} · {e.venue}, {areaName(e.area)} · {e.isFree ? "Free" : (e.priceText ?? "Paid")}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="mt-6 flex flex-col items-start gap-2.5 rounded-tile bg-yolk p-5 text-yolk-ink sm:p-6">
          <h2 className="font-display text-2xl font-bold leading-tight">Run a club or class?</h2>
          <p className="text-base">Put your kids&apos; event on Little Outings for free.</p>
          <Link href="/submit" className="flex min-h-11 items-center rounded-2xl bg-cobalt px-5 font-semibold text-white hover:opacity-90">
            Add your event
          </Link>
        </section>
      </div>
    </>
  );
}

function ResultsSkeleton({ region }: { region: Region }) {
  return (
    <>
      <Hero region={region}>
        <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
      </Hero>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-8 md:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[200px] animate-pulse rounded-tile bg-cobalt-soft" />
        ))}
      </div>
    </>
  );
}

export default async function RegionPage({ params, searchParams }: PageProps<"/[region]">) {
  const region = getRegion((await params).region);
  if (!region || !region.live) notFound();
  return (
    <Suspense fallback={<ResultsSkeleton region={region} />}>
      <Results region={region} searchParams={searchParams} />
    </Suspense>
  );
}
