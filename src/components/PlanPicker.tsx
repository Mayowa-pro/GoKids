"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AGE_OPTIONS, DAY_STRIP_DAYS, toSearch, type EventFilters } from "@/lib/filters";
import type { Area } from "@/lib/site";
import { addDays, londonMidnight } from "@/lib/time";

const pill = (on: boolean) =>
  `whitespace-nowrap rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold ${on ? "bg-yolk text-yolk-ink" : "bg-white/15 text-hero-ink hover:bg-white/25"}`;

function dayParts(key: string) {
  const noon = new Date(londonMidnight(key).getTime() + 12 * 3600_000);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", ...o }).format(noon);
  return { dow: f({ weekday: "short" }), num: f({ day: "numeric" }), long: f({ weekday: "long", day: "numeric", month: "long" }) };
}

/** The "Who's coming?" and "When?" questions at the top of the page. */
export function PlanPicker({ filters, todayKey }: { filters: EventFilters; todayKey: string }) {
  const pathname = usePathname();
  const href = (patch: Partial<EventFilters>) => pathname + toSearch({ ...filters, ...patch });
  const days = Array.from({ length: DAY_STRIP_DAYS }, (_, i) => addDays(todayKey, i));
  const dayActive = (key: string) =>
    (filters.when === "date" && filters.date === key) || (key === todayKey && filters.when === "today") || (key === addDays(todayKey, 1) && filters.when === "tomorrow");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-semibold">Who&apos;s coming?</h2>
        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((o) => (
            <Link key={o.value} href={href({ age: o.value })} scroll={false} aria-current={filters.age === o.value ? "true" : undefined} className={pill(filters.age === o.value)}>
              {o.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-semibold">When?</h2>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["week", "Next 7 days"],
              ["weekend", "This weekend"],
              ["all", "Everything"],
            ] as const
          ).map(([w, label]) => (
            <Link key={w} href={href({ when: w, date: undefined })} scroll={false} aria-current={filters.when === w ? "true" : undefined} className={pill(filters.when === w)}>
              {label}
            </Link>
          ))}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="list" aria-label="Pick a day">
          {days.map((key, i) => {
            const d = dayParts(key);
            const on = dayActive(key);
            return (
              <Link
                key={key}
                role="listitem"
                href={href(i === 0 ? { when: "today", date: undefined } : { when: "date", date: key })}
                scroll={false}
                aria-current={on ? "true" : undefined}
                aria-label={i === 0 ? `Today, ${d.long}` : d.long}
                className={`flex min-h-16 w-[60px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl ${on ? "bg-yolk text-yolk-ink" : "bg-white/15 text-hero-ink hover:bg-white/25"}`}
              >
                <span className="text-[13px] font-semibold">{i === 0 ? "Today" : d.dow}</span>
                <span className="font-display text-[22px] font-bold leading-none">{d.num}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Search, free-only and "near" controls under the hero. */
export function SearchRow({ filters, areas }: { filters: EventFilters; areas: Area[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(filters.q);
  const [pending, startTransition] = useTransition();
  const href = (patch: Partial<EventFilters>) => pathname + toSearch({ ...filters, ...patch });

  // Search as you type, after a short pause.
  useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => startTransition(() => router.replace(pathname + toSearch({ ...filters, q }), { scroll: false })), 300);
    return () => clearTimeout(t);
  }, [q, filters, pathname, router]);

  return (
    <div className={`flex flex-wrap items-center gap-2 transition-opacity ${pending ? "opacity-70" : ""}`}>
      <label className="flex min-h-11 min-w-0 flex-[1_1_240px] items-center gap-2 rounded-2xl bg-cobalt-soft px-3.5">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M11 11l4 4" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="sr-only">Search events</span>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search swimming, Lego, story time…"
          className="w-full min-w-0 bg-transparent py-2.5 outline-none"
          autoComplete="off"
        />
      </label>
      <Link
        href={href({ free: !filters.free })}
        scroll={false}
        aria-current={filters.free ? "true" : undefined}
        className={`flex min-h-11 items-center rounded-2xl px-4 text-[15px] font-semibold ${filters.free ? "bg-yolk text-yolk-ink" : "bg-cobalt-soft hover:bg-[var(--tile-3)]"}`}
      >
        Free only
      </Link>
      <label className="flex min-h-11 items-center gap-2 rounded-2xl bg-cobalt-soft pl-3.5 pr-1.5 text-[15px] font-semibold">
        Near
        <select
          id="near"
          value={filters.near ?? ""}
          onChange={(e) => router.replace(href({ near: e.target.value || undefined }), { scroll: false })}
          className="rounded-xl bg-surface px-2 py-1.5"
        >
          <option value="">Anywhere</option>
          {areas.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
