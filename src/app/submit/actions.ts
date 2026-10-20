"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { geocodePostcode } from "@/lib/postcode";
import { LIVE_REGIONS } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { londonMidnight } from "@/lib/time";
import { validateSubmission, type FieldErrors } from "@/lib/validation";

export type SubmitState = { status: "idle" } | { status: "error"; errors: FieldErrors; values: Record<string, string> } | { status: "ok"; title: string };

function at(date: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(londonMidnight(date).getTime() + (h * 60 + m) * 60_000);
}

export async function submitEvent(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const values = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));

  // Bots fill in every field, including this hidden one.
  if (values.website) return { status: "ok", title: values.title ?? "" };

  const result = validateSubmission(values);
  if (!result.ok) return { status: "error", errors: result.errors, values };
  const s = result.data;

  const startsAt = at(s.date, s.start);
  if (startsAt.getTime() < Date.now() - 3600_000) {
    return { status: "error", errors: { date: "That date has already passed" }, values };
  }

  const region = LIVE_REGIONS.find((r) => r.areas.some((a) => a.slug === s.area))!;
  const area = region.areas.find((a) => a.slug === s.area)!;
  // Fall back to the town centre if the postcode lookup is unavailable; a moderator can fix it.
  const point = (await geocodePostcode(s.postcode)) ?? { lat: area.lat, lng: area.lng };

  try {
    await db.insert(events).values({
      slug: `${slugify(s.title)}-${s.date}-${Math.random().toString(36).slice(2, 6)}`,
      title: s.title,
      description: s.description,
      category: s.category,
      region: region.slug,
      area: s.area,
      venue: s.venue,
      postcode: s.postcode,
      lat: point.lat,
      lng: point.lng,
      startsAt,
      endsAt: at(s.date, s.end),
      isFree: s.isFree,
      priceText: s.isFree ? null : s.priceText,
      minAge: s.minAge,
      maxAge: s.maxAge,
      organiser: s.organiser,
      contactEmail: s.contactEmail,
      bookingUrl: s.bookingUrl || null,
      status: "pending",
    });
  } catch (err) {
    console.error("submitEvent failed", err);
    return { status: "error", errors: { form: "We couldn't save your event. Please try again in a minute." }, values };
  }
  return { status: "ok", title: s.title };
}
