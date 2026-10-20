"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AGE_OPTIONS, WHEN_OPTIONS, toSearch, type EventFilters } from "@/lib/filters";
import type { Area } from "@/lib/site";

function Chip({ href, active, children, tone }: { href: string; active: boolean; children: React.ReactNode; tone?: "free" }) {
  const on = tone === "free" ? "border-yolk bg-yolk text-yolk-ink" : "border-ink bg-ink text-bg";
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold ${active ? on : "border-line bg-surface hover:border-cobalt"}`}
    >
      {children}
    </Link>
  );
}

export function FilterBar({ filters, areas }: { filters: EventFilters; areas: Area[] }) {
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
    <div className={`flex flex-col gap-2.5 transition-opacity ${pending ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-[1_1_240px] items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2">
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
            placeholder="Search messy play, football, museums…"
            className="w-full min-w-0 bg-transparent outline-none"
            autoComplete="off"
          />
        </label>
        <Chip href={href({ free: !filters.free })} active={filters.free} tone="free">
          Free only
        </Chip>
        <label className="flex items-center gap-2">
          <span className="label">Near</span>
          <select
            id="near"
            value={filters.near ?? ""}
            onChange={(e) => router.replace(href({ near: e.target.value || undefined }), { scroll: false })}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold"
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="label mr-1">When</span>
        {WHEN_OPTIONS.map((o) => (
          <Chip key={o.value} href={href({ when: o.value })} active={filters.when === o.value}>
            {o.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="label mr-1">Ages</span>
        {AGE_OPTIONS.map((o) => (
          <Chip key={o.value} href={href({ age: o.value })} active={filters.age === o.value}>
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
