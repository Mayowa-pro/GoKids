import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PriceBadge } from "@/components/PriceBadge";
import { tileColour } from "@/components/EventTile";
import { getEventBySlug } from "@/db/queries";
import { SITE, getRegion } from "@/lib/site";
import { repeatLabel } from "@/lib/recurrence";
import { formatLongDate, formatTime, isMultiDay } from "@/lib/time";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  await connection();
  const e = await getEventBySlug((await params).slug);
  if (!e) return { title: "Event not found" };
  return {
    title: `${e.title} at ${e.venue}`,
    description: e.description.slice(0, 160),
    alternates: { canonical: `/events/${e.slug}` },
  };
}

async function EventDetail({ params }: { params: PageProps<"/events/[slug]">["params"] }) {
  const { slug } = await params;
  await connection();
  const e = await getEventBySlug(slug);
  if (!e) notFound();
  const region = getRegion(e.region);
  const areaName = region?.areas.find((a) => a.slug === e.area)?.name ?? e.area;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.postcode ?? areaName}`)}`;

  // Structured data so search engines can show the event in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.description,
    startDate: e.startsAt.toISOString(),
    endDate: e.endsAt.toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    typicalAgeRange: `${e.minAge}-${e.maxAge}`,
    isAccessibleForFree: e.isFree,
    location: {
      "@type": "Place",
      name: e.venue,
      address: { "@type": "PostalAddress", postalCode: e.postcode ?? undefined, addressLocality: areaName, addressRegion: region?.name, addressCountry: "GB" },
      geo: { "@type": "GeoCoordinates", latitude: e.lat, longitude: e.lng },
    },
    organizer: { "@type": "Organization", name: e.organiser },
    url: `${SITE.url}/events/${e.slug}`,
  };

  return (
    <article className="max-w-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href={`/${e.region}`} className="text-sm font-semibold text-cobalt hover:underline">
        ← All events in {region?.name ?? e.region}
      </Link>
      {e.isSample && (
        <p role="note" className="mt-5 rounded-xl border-2 border-dashed border-paid bg-paid-soft px-4 py-3 text-sm">
          <strong>Sample event:</strong> this is an example to show how the site works. It isn&apos;t really happening.
        </p>
      )}
      <div className="mt-5">
        {e.featured ? <div className="label !text-cobalt">★ Featured listing</div> : <div className="label">{e.category}</div>}
        <h1 className="mt-1.5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{e.title}</h1>
        <div className="mt-3">
          <PriceBadge isFree={e.isFree} priceText={e.priceText} />
        </div>
      </div>
      <dl className={`mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-3 rounded-tile p-5 ${tileColour(e.id)}`}>
        <dt className="label pt-0.5">When</dt>
        <dd>
          {e.repeatsWeekly && (
            <>
              <strong>{repeatLabel(e)}</strong>. Next session:{" "}
            </>
          )}
          {isMultiDay(e) ? `${formatLongDate(e.startsAt)} to ${formatLongDate(e.endsAt)}` : formatLongDate(e.startsAt)}
          <br />
          <span className="tabular-nums">
            {e.timesNote ?? `${formatTime(e.startsAt)} to ${formatTime(e.endsAt)}`}
          </span>
        </dd>
        <dt className="label pt-0.5">Where</dt>
        <dd>
          {e.venue}, {areaName}
          {e.postcode && <span className="text-muted"> · {e.postcode}</span>}
        </dd>
        <dt className="label pt-0.5">Ages</dt>
        <dd>
          {e.minAge} to {e.maxAge}
        </dd>
        <dt className="label pt-0.5">Run by</dt>
        <dd>{e.organiser}</dd>
      </dl>
      <p className="mt-6 max-w-[62ch] text-base">{e.description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {e.bookingUrl && (
          <a href={e.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center rounded-2xl bg-cobalt px-5 font-semibold text-white hover:opacity-90">
            Book or find out more
          </a>
        )}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center rounded-2xl bg-cobalt-soft px-5 font-semibold text-cobalt hover:opacity-90">
          Directions
        </a>
      </div>
    </article>
  );
}

export default function EventPage({ params }: PageProps<"/events/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div className="h-64 max-w-2xl animate-pulse rounded-2xl bg-surface" />}>
        <EventDetail params={params} />
      </Suspense>
    </div>
  );
}
