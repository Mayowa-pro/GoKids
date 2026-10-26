import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { EventTile, tileColour } from "@/components/EventTile";
import { listEvents, type PublicEvent } from "@/db/queries";
import { LIVE_REGIONS, SITE } from "@/lib/site";
import { formatDayShort, formatTime, isMultiDay, londonDateKey } from "@/lib/time";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Tells search engines the site's name, so Google shows "My Little Outings" rather than the web address. */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: SITE.name, url: SITE.url, inLanguage: "en-GB" },
    { "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg`, email: SITE.email, areaServed: "Stoke-on-Trent" },
  ],
};

const region = LIVE_REGIONS[0];
const areaName = (slug: string) => region.areas.find((a) => a.slug === slug)?.name ?? slug;

/** A mix of kinds of event, so the front page isn't all one thing. */
function variety(list: PublicEvent[], n: number) {
  const picked: PublicEvent[] = [];
  const seen = new Set<string>();
  for (const e of list) {
    if (picked.length < n && !seen.has(e.category)) {
      seen.add(e.category);
      picked.push(e);
    }
  }
  for (const e of list) if (picked.length < n && !picked.includes(e)) picked.push(e);
  return picked.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

async function TodayCard() {
  await connection();
  const now = new Date();
  let when: "today" | "week" = "today";
  let list = await listEvents(region.slug, { when, age: "all", free: false, q: "" }, now);
  if (list.length < 3) {
    when = "week";
    list = await listEvents(region.slug, { when, age: "all", free: false, q: "" }, now);
  }
  const picks = variety(list, 3);
  const todayKey = londonDateKey(now);
  const pickTime = (e: PublicEvent) =>
    isMultiDay(e) ? "Daily" : londonDateKey(e.startsAt) === todayKey ? formatTime(e.startsAt) : `${formatDayShort(e.startsAt, false)}, ${formatTime(e.startsAt)}`;
  return (
    <div className="rounded-tile bg-surface p-4 text-ink shadow-[0_12px_40px_rgba(30,20,66,0.25)]">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold">{when === "today" ? "On today" : "Coming up"} in {region.name}</h2>
        <Link href={`/${region.slug}`} className="text-sm font-semibold text-cobalt hover:underline">
          See all
        </Link>
      </div>
      <ul className="flex flex-col gap-2.5">
        {picks.map((e) => (
          <li key={e.id}>
            <Link href={`/events/${e.slug}`} className={`flex items-center gap-3 rounded-[18px] p-3 hover:outline hover:outline-2 hover:outline-cobalt ${tileColour(e.id)}`}>
              <span className="shrink-0 rounded-xl bg-surface px-2.5 py-1 text-[13px] font-bold tabular-nums">{pickTime(e)}</span>
              <span className="min-w-0">
                <span className="block truncate font-display text-[17px] font-semibold leading-tight">{e.title}</span>
                <span className="block truncate text-sm">
                  {e.venue} · {e.isFree ? "Free" : (e.priceText ?? "Paid")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function ThisWeek() {
  await connection();
  const list = await listEvents(region.slug, { when: "week", age: "all", free: false, q: "" }, new Date());
  const picks = variety(list, 6);
  if (!picks.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">Ideas for this week</h2>
        <Link href={`/${region.slug}?when=week`} className="font-semibold text-cobalt hover:underline">
          See all {list.length}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {picks.map((e) => (
          <EventTile key={e.id} event={e} areaName={areaName(e.area)} showDay />
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { n: "1", title: "Pick who's coming", text: "Babies, toddlers, school-age kids or teens.", bg: "bg-[var(--tile-1)]" },
  { n: "2", title: "Pick a day", text: "Today, the weekend or any day in the next two weeks.", bg: "bg-[var(--tile-2)]" },
  { n: "3", title: "Off you go", text: "Free and paid ideas near you, with times, prices and directions.", bg: "bg-[var(--tile-4)]" },
];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c") }} />
      <section className="relative overflow-hidden rounded-b-[32px] bg-hero text-hero-ink">
        <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-coral" />
        <div aria-hidden="true" className="absolute bottom-10 left-[46%] size-12 rounded-full bg-yolk max-lg:hidden" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <h1 className="max-w-[16ch] font-display text-[40px] font-bold leading-[1.02] sm:text-6xl">Plan a fun day out with the kids</h1>
            <p className="mt-4 max-w-[52ch] text-lg">
              Story times, swimming, half-term trails and more across Stoke-on-Trent, all in one place. Pick who&apos;s coming and a day, and we&apos;ll show you
              what&apos;s on. Always free for parents.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${region.slug}`} className="flex min-h-12 items-center rounded-2xl bg-yolk px-5 font-semibold text-yolk-ink hover:opacity-90">
                See what&apos;s on in {region.name}
              </Link>
              <Link href="/submit" className="flex min-h-12 items-center rounded-2xl bg-white/15 px-5 font-semibold hover:bg-white/25">
                List your event free
              </Link>
            </div>
          </div>
          <Suspense fallback={<div className="h-72 animate-pulse rounded-tile bg-white/10" />}>
            <TodayCard />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="mb-4 font-display text-2xl font-bold">How it works</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className={`flex gap-4 rounded-tile p-5 ${s.bg}`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cobalt font-display text-xl font-bold text-white">{s.n}</span>
              <span>
                <span className="block font-display text-xl font-semibold">{s.title}</span>
                <span className="text-[15px]">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Suspense fallback={null}>
        <ThisWeek />
      </Suspense>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-3 md:grid-cols-2">
          <Link href={`/${region.slug}`} className="flex flex-col gap-1 rounded-tile bg-[var(--tile-3)] p-6 hover:outline hover:outline-[3px] hover:outline-cobalt">
            <span className="text-sm font-bold uppercase tracking-wider text-cobalt">Pick your area</span>
            <span className="font-display text-2xl font-semibold">{region.name}</span>
            <span className="text-sm">{region.areas.map((a) => a.name).join(" · ")}</span>
            <span className="mt-2 text-sm text-muted">More towns across the Midlands are coming soon.</span>
          </Link>
          <div className="flex flex-col items-start gap-2.5 rounded-tile bg-yolk p-6 text-yolk-ink">
            <h2 className="font-display text-2xl font-bold leading-tight">Run a club or class?</h2>
            <p>Put your kids&apos; event on My Little Outings for free, and parents nearby will find it.</p>
            <Link href="/submit" className="flex min-h-11 items-center rounded-2xl bg-cobalt px-5 font-semibold text-white hover:opacity-90">
              Add your event
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
