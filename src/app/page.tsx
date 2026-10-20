import Link from "next/link";
import { REGIONS, SITE } from "@/lib/site";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-14 sm:py-20">
        <p className="label mb-3">{SITE.tagline}</p>
        <h1 className="max-w-[20ch] font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Every kids&apos; event near you, on one map.
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-muted">
          No more jumping between Facebook groups, Instagram pages and council websites. Free and paid family activities,
          sorted by day and distance. Always free for parents.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/stoke-on-trent" className="rounded-full bg-cobalt px-5 py-3 font-semibold text-surface hover:opacity-90">
            See what&apos;s on in Stoke-on-Trent
          </Link>
          <Link href="/submit" className="rounded-full border border-line bg-surface px-5 py-3 font-semibold hover:border-cobalt">
            List your event free
          </Link>
        </div>
      </section>

      <section className="pb-16">
        <h2 className="mb-4 font-display text-2xl font-semibold">Where we are</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r) => (
            <li key={r.slug}>
              {r.live ? (
                <Link href={`/${r.slug}`} className="flex items-center justify-between rounded-2xl border-2 border-cobalt bg-surface p-5 hover:bg-cobalt-soft">
                  <span>
                    <span className="block font-display text-xl font-semibold">{r.name}</span>
                    <span className="text-sm text-muted">{r.areas.map((a) => a.name).join(" · ")}</span>
                  </span>
                  <span className="rounded-full bg-yolk px-2.5 py-1 text-xs font-bold text-yolk-ink">Live</span>
                </Link>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-5 text-muted">
                  <span className="font-display text-xl font-semibold">{r.name}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Coming soon</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
