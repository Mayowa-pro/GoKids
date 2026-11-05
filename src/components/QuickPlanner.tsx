"use client";

import Link from "next/link";
import { useState } from "react";
import { AGE_OPTIONS, toSearch, type AgeBand, type When } from "@/lib/filters";

const DAYS: { value: When; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This weekend" },
  { value: "week", label: "Next 7 days" },
];

const pill = (on: boolean) =>
  `min-h-11 whitespace-nowrap rounded-2xl px-3.5 text-[15px] font-semibold ${on ? "bg-yolk text-yolk-ink" : "bg-surface text-ink hover:outline hover:outline-2 hover:outline-cobalt"}`;

function Step({ n, title, bg, children }: { n: string; title: string; bg: string; children: React.ReactNode }) {
  return (
    <li className={`flex gap-4 rounded-tile p-5 ${bg}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cobalt font-display text-xl font-bold text-white">{n}</span>
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        {children}
      </div>
    </li>
  );
}

/** "How it works" as a mini planner: pick who's coming and a day, then go straight to the matching ideas. */
export function QuickPlanner({ regionSlug }: { regionSlug: string }) {
  const [age, setAge] = useState<AgeBand>("all");
  const [when, setWhen] = useState<When>("today");
  const [free, setFree] = useState(false);
  const href = `/${regionSlug}${toSearch({ age, when, free })}`;

  return (
    <ol className="grid gap-3 md:grid-cols-3">
      <Step n="1" title="Pick who's coming" bg="bg-[var(--tile-1)]">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Who's coming">
          {AGE_OPTIONS.map((o) => (
            <button key={o.value} type="button" aria-pressed={age === o.value} onClick={() => setAge(o.value)} className={pill(age === o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </Step>
      <Step n="2" title="Pick a day" bg="bg-[var(--tile-2)]">
        <div className="flex flex-wrap gap-2" role="group" aria-label="When">
          {DAYS.map((d) => (
            <button key={d.value} type="button" aria-pressed={when === d.value} onClick={() => setWhen(d.value)} className={pill(when === d.value)}>
              {d.label}
            </button>
          ))}
        </div>
      </Step>
      <Step n="3" title="Off you go" bg="bg-[var(--tile-4)]">
        <label className="flex min-h-11 items-center gap-2.5 text-[15px] font-semibold">
          <input id="planner-free" type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} className="size-5 accent-cobalt" />
          Free things only
        </label>
        <Link href={href} className="flex min-h-12 items-center justify-center rounded-2xl bg-cobalt px-5 font-semibold text-surface hover:opacity-90">
          Show me ideas →
        </Link>
        <p className="text-sm">With times, prices and directions.</p>
      </Step>
    </ol>
  );
}
