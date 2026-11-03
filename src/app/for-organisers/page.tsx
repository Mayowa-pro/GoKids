import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "For organisers", description: "List your kids' club, class or event for free and reach local parents." };

const TIERS = [
  { name: "Free listing", price: "£0", per: "", points: ["In the feed and on the map", "Checked by a person before it goes live", "Your own event page, found on Google"], cta: "List an event", href: "/submit", best: true },
];

export default function OrganisersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="label">For clubs, classes and venues</p>
      <h1 className="mt-2 max-w-[22ch] font-display text-4xl font-bold leading-tight tracking-tight">Get your event in front of local parents</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-muted">
        Parents use {SITE.name} to plan the week. Listing your event is free.
      </p>
      <div className="mt-10 grid gap-4 max-w-sm">
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
    </div>
  );
}
