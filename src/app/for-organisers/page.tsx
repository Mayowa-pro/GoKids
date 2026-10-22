import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "For organisers", description: "List your kids' club, class or event for free, or boost it to reach more local parents." };

const TIERS = [
  { name: "Free listing", price: "£0", per: "", points: ["In the feed and on the map", "Checked by a person before it goes live", "Your own event page, found on Google"], cta: "List an event", href: "/submit" },
  { name: "Boost", price: "£9", per: "per event", points: ["★ Featured badge", "Top of its day for 7 days", "Highlighted pin on the map"], cta: "List, then ask us to boost", href: "/submit", best: true },
  { name: "Club partner", price: "£29", per: "per month", points: ["Every session boosted", "Club profile page", "Monthly views and clicks report"], cta: "Get in touch", href: "/submit" },
];

export default function OrganisersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="label">For clubs, classes and venues</p>
      <h1 className="mt-2 max-w-[22ch] font-display text-4xl font-bold leading-tight tracking-tight">Get your event in front of local parents</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-muted">
        Parents use {SITE.name} to plan the week. Listing is always free. Boosting puts you first.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className={`flex flex-col rounded-2xl bg-surface p-6 ${t.best ? "border-2 border-cobalt" : "border border-line"}`}>
            <h2 className="font-display text-xl font-semibold">{t.name}</h2>
            <p className="mt-2 tabular-nums">
              <span className="font-display text-4xl font-bold">{t.price}</span> <span className="text-muted">{t.per}</span>
            </p>
            <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
              {t.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <Link href={t.href} className={`mt-6 rounded-full px-5 py-2.5 text-center font-semibold ${t.best ? "bg-cobalt text-surface" : "border border-line"}`}>
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">Online payment for boosts is coming soon. Until then we&apos;ll invoice you.</p>
    </div>
  );
}
