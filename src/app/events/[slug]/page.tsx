import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PriceBadge } from "@/components/PriceBadge";
import { tileColour } from "@/components/EventTile";
import { getEventBySlug, listEvents, type PublicEvent } from "@/db/queries";
import { ShareButton } from "@/components/ShareButton";
import { SITE, getRegion } from "@/lib/site";
import { repeatLabel } from "@/lib/recurrence";
import { addDays, formatDayHeading, formatLongDate, formatTime, isMultiDay, londonDateKey, londonMidnight } from "@/lib/time";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  await connection();
  const e = await getEventBySlug((await params).slug);
  if (!e) return { title: "Event not found" };
  const region = getRegion(e.region);
  const when = isMultiDay(e) ? `${formatLongDate(e.startsAt)} to ${formatLongDate(e.endsAt)}` : formatLongDate(e.startsAt);
  const price = e.isFree ? "Free" : (e.priceText ?? "Paid");
  const summary = `${when} at ${e.venue}, ${region?.name ?? ""}. ${price}, ages ${e.minAge} to ${e.maxAge}.`;
  const description = `${summary} ${e.description}`.slice(0, 158).replace(/\s+\S*$/, "") + "…";
  return {
    title: `${e.title} at ${e.venue}`,
    description,
    alternates: { canonical: `/events/${e.slug}` },
    openGraph: { title: e.title, description: summary, type: "article", url: `/events/${e.slug}` },
    robots: e.isSample ? { index: false } : undefined,
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

  const price = e.priceFrom != null ? (e.priceFrom / 100).toFixed(2) : null;
  const soldOut = /sold out/i.test(e.priceText ?? "");
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
    organizer: { "@type": "Organization", name: e.organiser, url: e.bookingUrl ?? undefined },
    // Google asks for a performer; the organiser is the closest thing we know.
    performer: { "@type": "PerformingGroup", name: e.organiser },
    image: [`${SITE.url}/events/${e.slug}/opengraph-image`],
    // Only describe tickets when we know the price, so search engines never see an offer without one.
    offers:
      e.isFree || price != null
        ? {
            "@type": "Offer",
            price: e.isFree ? "0" : price,
            priceCurrency: "GBP",
            url: e.bookingUrl ?? `${SITE.url}/events/${e.slug}`,
            availability: soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            validFrom: e.listedAt.toISOString(),
          }
        : undefined,
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
        <dt className="label pt-0.5">Adults</dt>
        <dd>{e.adultPrice ? (/^free$/i.test(e.adultPrice) ? "Free" : e.adultPrice) : "Not stated. Check with the organiser."}</dd>
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
        <a href={`/events/${e.slug}/calendar`} className="flex min-h-12 items-center gap-2 rounded-2xl bg-cobalt-soft px-5 font-semibold text-cobalt hover:opacity-90">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
          Add to calendar
        </a>
        <ShareButton title={e.title} url={`${SITE.url}/events/${e.slug}`} className="flex min-h-12 items-center gap-2 rounded-2xl bg-cobalt-soft px-5 font-semibold text-cobalt hover:opacity-90" />
      </div>
      <Suspense fallback={null}>
        <SameDay event={e} areaName={(slug) => region?.areas.find((a) => a.slug === slug)?.name ?? slug} />
      </Suspense>
    </article>
  );
}

/** A few other things on the same day, so the page isn't a dead end. */
async function SameDay({ event: e, areaName }: { event: PublicEvent; areaName: (slug: string) => string }) {
  const key = londonDateKey(e.startsAt);
  const now = new Date();
  const from = londonMidnight(key) > now ? londonMidnight(key) : now;
  const others = (
    await listEvents(e.region, { when: "date", date: key, age: "all", free: false, q: "" }, now, { from, to: londonMidnight(addDays(key, 1)) })
  )
    .filter((o) => o.id !== e.id)
    .slice(0, 4);
  if (!others.length) return null;
  const day = formatDayHeading(key, londonDateKey(now));
  const dayName = day.label === "Today" || day.label === "Tomorrow" ? day.label.toLowerCase() : `on ${day.label}`;
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-2xl font-bold">More {dayName}</h2>
      <ul className="flex flex-col gap-2.5">
        {others.map((o) => (
          <li key={o.id}>
            <Link href={`/events/${o.slug}`} className={`flex items-center gap-3 rounded-[18px] p-3 hover:outline hover:outline-2 hover:outline-cobalt ${tileColour(o.id)}`}>
              <span className="shrink-0 rounded-xl bg-surface px-2.5 py-1 text-[13px] font-bold tabular-nums">{isMultiDay(o) ? "All day" : formatTime(o.startsAt)}</span>
              <span className="min-w-0">
                <span className="block font-display text-[17px] font-semibold leading-tight">{o.title}</span>
                <span className="block text-sm">
                  {o.venue}, {areaName(o.area)} · {o.isFree ? "Free" : (o.priceText ?? "Paid")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/${e.region}?day=${key}`} className="mt-3 inline-block font-semibold text-cobalt hover:underline">
        See everything on that day →
      </Link>
    </section>
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
