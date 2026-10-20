"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CATEGORIES, type Area } from "@/lib/site";
import { submitEvent, type SubmitState } from "./actions";

const input = "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 aria-invalid:border-danger";

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitForm({ areas }: { areas: Area[] }) {
  // Remounting with a new key clears the form after a successful send.
  const [key, setKey] = useState(0);
  return <Form key={key} areas={areas} onReset={() => setKey((k) => k + 1)} />;
}

function Form({ areas, onReset }: { areas: Area[]; onReset: () => void }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitEvent, { status: "idle" });
  const v = state.status === "error" ? state.values : {};
  const err = state.status === "error" ? state.errors : {};
  const [isFree, setIsFree] = useState(v.isFree !== "no");

  if (state.status === "ok") {
    return (
      <div className="rounded-2xl border-2 border-cobalt bg-surface p-6">
        <h2 className="font-display text-2xl font-semibold">Thanks, we&apos;ve got it</h2>
        <p className="mt-2 text-muted">
          &ldquo;{state.title}&rdquo; is waiting for a quick check. Once it&apos;s approved it will show on the map and in the feed.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onReset} className="rounded-full bg-cobalt px-5 py-2.5 font-semibold text-surface">
            Add another event
          </button>
          <Link href="/for-organisers" className="rounded-full border border-line px-5 py-2.5 font-semibold">
            Boost this event
          </Link>
        </div>
      </div>
    );
  }

  const a = (name: string) => ({ id: name, name, defaultValue: v[name], "aria-invalid": err[name as keyof typeof err] ? true : undefined, "aria-describedby": err[name as keyof typeof err] ? `${name}-error` : undefined });

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {err.form && <p className="rounded-xl border border-danger p-3 font-medium text-danger">{err.form}</p>}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Field id="title" label="Event name" error={err.title}>
        <input {...a("title")} className={input} maxLength={90} required />
      </Field>
      <Field id="description" label="What happens" error={err.description} hint="What will kids do? What should parents bring?">
        <textarea {...a("description")} className={`${input} min-h-28`} maxLength={1200} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="category" label="Category" error={err.category}>
          <select {...a("category")} className={input} defaultValue={v.category ?? ""}>
            <option value="" disabled>Choose one</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="area" label="Nearest town" error={err.area}>
          <select {...a("area")} className={input} defaultValue={v.area ?? ""}>
            <option value="" disabled>Choose one</option>
            {areas.map((ar) => <option key={ar.slug} value={ar.slug}>{ar.name}</option>)}
          </select>
        </Field>
        <Field id="venue" label="Venue" error={err.venue}>
          <input {...a("venue")} className={input} placeholder="e.g. Hanley Library" />
        </Field>
        <Field id="postcode" label="Postcode" error={err.postcode} hint="We use it to put the pin on the map.">
          <input {...a("postcode")} className={input} autoComplete="postal-code" placeholder="ST1 3RS" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="date" label="Date" error={err.date}>
          <input {...a("date")} type="date" className={input} />
        </Field>
        <Field id="start" label="Starts" error={err.start}>
          <input {...a("start")} type="time" className={input} />
        </Field>
        <Field id="end" label="Ends" error={err.end}>
          <input {...a("end")} type="time" className={input} />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold">Price</legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="isFree" value="yes" checked={isFree} onChange={() => setIsFree(true)} /> Free
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="isFree" value="no" checked={!isFree} onChange={() => setIsFree(false)} /> Paid
          </label>
        </div>
        {!isFree && (
          <Field id="priceText" label="How much?" error={err.priceText}>
            <input {...a("priceText")} className={input} placeholder="£5 per child" maxLength={40} />
          </Field>
        )}
      </fieldset>

      <div className="grid grid-cols-2 gap-5">
        <Field id="minAge" label="Youngest age" error={err.minAge}>
          <input {...a("minAge")} defaultValue={v.minAge ?? "0"} type="number" min={0} max={17} className={input} />
        </Field>
        <Field id="maxAge" label="Oldest age" error={err.maxAge}>
          <input {...a("maxAge")} defaultValue={v.maxAge ?? "11"} type="number" min={0} max={17} className={input} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="organiser" label="Organiser" error={err.organiser}>
          <input {...a("organiser")} className={input} autoComplete="organization" />
        </Field>
        <Field id="contactEmail" label="Your email" error={err.contactEmail} hint="Only used to contact you about this listing.">
          <input {...a("contactEmail")} type="email" className={input} autoComplete="email" />
        </Field>
      </div>
      <Field id="bookingUrl" label="Booking or info link (optional)" error={err.bookingUrl}>
        <input {...a("bookingUrl")} type="url" className={input} placeholder="https://" />
      </Field>

      <button type="submit" disabled={pending} className="self-start rounded-full bg-cobalt px-6 py-3 font-semibold text-surface disabled:opacity-60">
        {pending ? "Sending…" : "Send for approval"}
      </button>
    </form>
  );
}
