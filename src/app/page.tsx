import Link from "next/link";
import { LIVE_REGIONS } from "@/lib/site";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden rounded-b-[32px] bg-hero text-hero-ink">
        <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-coral" />
        <div aria-hidden="true" className="absolute right-36 top-28 size-12 rounded-full bg-yolk max-sm:right-24" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h1 className="max-w-[16ch] font-display text-[40px] font-bold leading-[1.02] sm:text-6xl">Plan a fun day out with the kids</h1>
          <p className="mt-4 max-w-[52ch] text-lg">
            Story times, swimming, half-term trails and more, all in one place. Pick who&apos;s coming and a day, and we&apos;ll show you
            what&apos;s on. Always free for parents.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/stoke-on-trent" className="flex min-h-12 items-center rounded-2xl bg-yolk px-5 font-semibold text-yolk-ink hover:opacity-90">
              See what&apos;s on in Stoke-on-Trent
            </Link>
            <Link href="/submit" className="flex min-h-12 items-center rounded-2xl bg-white/15 px-5 font-semibold hover:bg-white/25">
              List your event free
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Pick your area</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_REGIONS.map((r) => (
            <li key={r.slug}>
              <Link href={`/${r.slug}`} className="flex h-full flex-col gap-1 rounded-tile bg-[var(--tile-3)] p-5 hover:outline hover:outline-[3px] hover:outline-cobalt">
                <span className="font-display text-xl font-semibold">{r.name}</span>
                <span className="text-sm">{r.areas.map((a) => a.name).join(" · ")}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-muted">More towns across the Midlands are coming soon.</p>
      </section>
    </>
  );
}
