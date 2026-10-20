import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { EventsExplorer } from "@/components/EventsExplorer";
import { FilterBar } from "@/components/FilterBar";
import { listEvents } from "@/db/queries";
import { parseFilters } from "@/lib/filters";
import { LIVE_REGIONS, getRegion, type Region } from "@/lib/site";
import { londonDateKey } from "@/lib/time";

export function generateStaticParams() {
  return LIVE_REGIONS.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[region]">): Promise<Metadata> {
  const region = getRegion((await params).region);
  if (!region) return {};
  return {
    title: `Kids' events in ${region.name} this week`,
    description: `Free and paid family events across ${region.name}${region.areas.length ? `: ${region.areas.map((a) => a.name).join(", ")}` : ""}.`,
    alternates: { canonical: `/${region.slug}` },
  };
}

async function Results({ region, searchParams }: { region: Region; searchParams: PageProps<"/[region]">["searchParams"] }) {
  const filters = parseFilters(await searchParams);
  await connection();
  const now = new Date();
  const events = await listEvents(region.slug, filters, now);
  return (
    <>
      <div className="sticky top-[57px] z-[900] -mx-4 border-b border-line bg-bg px-4 py-3 max-lg:static">
        <FilterBar filters={filters} areas={region.areas} />
      </div>
      <div className="pt-5">
        <EventsExplorer
          events={events}
          areas={region.areas}
          near={filters.near}
          center={region.center}
          zoom={region.zoom}
          todayKey={londonDateKey(now)}
        />
      </div>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 py-5" aria-busy="true">
      <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl border border-line bg-surface" />
      ))}
    </div>
  );
}

export default async function RegionPage({ params, searchParams }: PageProps<"/[region]">) {
  const region = getRegion((await params).region);
  if (!region || !region.live) notFound();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="pb-2 pt-6">
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          What&apos;s on for kids in {region.name}
        </h1>
        <p className="mt-1 max-w-[60ch] text-muted">
          {region.areas.map((a) => a.name).join(", ")}. Free events are marked in yellow.
        </p>
      </section>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results region={region} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
