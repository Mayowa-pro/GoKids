import type { Metadata } from "next";
import { Suspense } from "react";
import { PriceBadge } from "@/components/PriceBadge";
import { listByStatus } from "@/db/queries";
import type { EventRow } from "@/db/schema";
import { adminEnabled, isAdmin } from "@/lib/auth";
import { formatLongDate, formatTime } from "@/lib/time";
import { LoginForm } from "./LoginForm";
import { deleteSamples, logout, moderate } from "./actions";

export const metadata: Metadata = { title: "Moderation", robots: { index: false } };

function Btn({ id, op, children, tone = "plain" }: { id: number; op: string; children: React.ReactNode; tone?: "primary" | "danger" | "plain" }) {
  const cls = {
    primary: "bg-cobalt text-surface border-cobalt",
    danger: "border-danger text-danger",
    plain: "border-line",
  }[tone];
  return (
    <form action={moderate}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <button className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${cls}`}>{children}</button>
    </form>
  );
}

function Row({ e, mode }: { e: EventRow; mode: "pending" | "approved" }) {
  const featured = !!e.featuredUntil && e.featuredUntil > new Date();
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold">{e.title}</h3>
          <p className="text-sm text-muted">
            {formatLongDate(e.startsAt)}, {formatTime(e.startsAt)}–{formatTime(e.endsAt)} · {e.venue} ({e.postcode}) · ages {e.minAge}–{e.maxAge}
          </p>
          <p className="text-sm text-muted">
            {e.organiser}
            {e.contactEmail && <> · <span className="select-all">{e.contactEmail}</span></>}
          </p>
        </div>
        <PriceBadge isFree={e.isFree} priceText={e.priceText} />
      </div>
      {mode === "pending" && <p className="max-w-[70ch] text-sm">{e.description}</p>}
      <div className="flex flex-wrap gap-2">
        {mode === "pending" ? (
          <>
            <Btn id={e.id} op="approve" tone="primary">Approve</Btn>
            <Btn id={e.id} op="reject" tone="danger">Reject</Btn>
          </>
        ) : featured ? (
          <Btn id={e.id} op="unfeature">Remove feature (until {formatLongDate(e.featuredUntil!)})</Btn>
        ) : (
          <Btn id={e.id} op="feature" tone="primary">Feature for 7 days</Btn>
        )}
      </div>
    </li>
  );
}

async function Dashboard() {
  if (!adminEnabled()) {
    return <p className="text-muted">Moderation is switched off. Set ADMIN_PASSWORD (8+ characters) in your environment to turn it on.</p>;
  }
  if (!(await isAdmin())) return <LoginForm />;
  const [pending, approved] = await Promise.all([listByStatus("pending"), listByStatus("approved")]);
  const now = new Date();
  const upcoming = approved.filter((e) => e.endsAt > now);
  const sampleCount = approved.filter((e) => e.isSample).length;
  return (
    <div className="flex flex-col gap-10">
      <form action={logout}><button className="text-sm font-semibold text-cobalt hover:underline">Sign out</button></form>
      {sampleCount > 0 && (
        <section className="rounded-2xl border-2 border-dashed border-paid bg-paid-soft p-4">
          <h2 className="font-display text-lg font-semibold">Sample events ({sampleCount})</h2>
          <p className="mt-1 text-sm">
            These made-up examples are on the site so it doesn&apos;t look empty. Remove them once you have real events. This can&apos;t be undone.
          </p>
          <form action={deleteSamples} className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="confirm" value="yes" required /> Yes, I have real events now
            </label>
            <button className="rounded-full border border-danger bg-surface px-4 py-2 text-sm font-semibold text-danger">
              Remove all sample events
            </button>
          </form>
        </section>
      )}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Waiting for approval ({pending.length})</h2>
        {pending.length ? <ul className="flex flex-col gap-3">{pending.map((e) => <Row key={e.id} e={e} mode="pending" />)}</ul> : <p className="text-muted">Nothing to check. New submissions will appear here.</p>}
      </section>
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Live and upcoming ({upcoming.length})</h2>
        <ul className="flex flex-col gap-3">{upcoming.map((e) => <Row key={e.id} e={e} mode="approved" />)}</ul>
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tight">Moderation</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-surface" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
