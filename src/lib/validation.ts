import { z } from "zod";
import { CATEGORIES, LIVE_REGIONS } from "./site";

const areaSlugs = LIVE_REGIONS.flatMap((r) => r.areas.map((a) => a.slug));
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use the format 14:30");

export const submissionSchema = z
  .object({
    title: z.string().trim().min(4, "Give the event a name (at least 4 characters)").max(90),
    description: z.string().trim().min(20, "Tell parents a bit more (at least 20 characters)").max(1200),
    category: z.enum(CATEGORIES, { message: "Pick a category" }),
    area: z.string().refine((v) => areaSlugs.includes(v), "Pick the nearest town"),
    venue: z.string().trim().min(2, "Where is it?").max(100),
    postcode: z
      .string()
      .trim()
      .regex(UK_POSTCODE, "Enter a UK postcode, like ST1 3RS")
      .transform((v) => v.toUpperCase().replace(/\s+/g, "").replace(/(\w{3})$/, " $1")),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    start: time,
    end: time,
    isFree: z.enum(["yes", "no"]).transform((v) => v === "yes"),
    priceText: z.string().trim().max(40).optional().default(""),
    minAge: z.coerce.number().int().min(0).max(17),
    maxAge: z.coerce.number().int().min(0).max(17),
    organiser: z.string().trim().min(2, "Who runs it?").max(80),
    contactEmail: z.email("Enter an email we can reach you on"),
    bookingUrl: z.union([z.literal(""), z.url({ protocol: /^https?$/, message: "Links must start with https://" })]).optional().default(""),
  })
  .refine((v) => v.end > v.start, { path: ["end"], message: "The end time must be after the start" })
  .refine((v) => v.maxAge >= v.minAge, { path: ["maxAge"], message: "The oldest age must be at least the youngest" })
  .refine((v) => v.isFree || v.priceText.length > 0, { path: ["priceText"], message: "Add a price, like £5 per child" });

export type Submission = z.infer<typeof submissionSchema>;

export type FieldErrors = Partial<Record<keyof Submission | "form", string>>;

export function validateSubmission(input: Record<string, unknown>): { ok: true; data: Submission } | { ok: false; errors: FieldErrors } {
  const r = submissionSchema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const errors: FieldErrors = {};
  for (const issue of r.error.issues) {
    const k = (issue.path[0] as keyof FieldErrors) ?? "form";
    errors[k] ??= issue.message;
  }
  return { ok: false, errors };
}

/**
 * An event found by the weekly scout. Same rules as the organiser form, but no contact email,
 * and a source link is required so a moderator can check it.
 */
export const scoutedEventSchema = z
  .object({
    title: z.string().trim().min(4).max(90),
    description: z.string().trim().min(20).max(1200),
    category: z.enum(CATEGORIES),
    area: z.string().refine((v) => areaSlugs.includes(v), "Unknown area"),
    venue: z.string().trim().min(2).max(100),
    postcode: z
      .string()
      .trim()
      .regex(UK_POSTCODE)
      .transform((v) => v.toUpperCase().replace(/\s+/g, "").replace(/(\w{3})$/, " $1"))
      .optional(),
    lat: z.number().min(52.5).max(53.5).optional(),
    lng: z.number().min(-2.6).max(-1.6).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** Last day, for events that run every day over a date range. */
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    start: time,
    end: time,
    /** Plain wording when there are several sessions, e.g. "Two shows: 1–3pm and 5–7pm". */
    timesNote: z.string().trim().max(120).optional(),
    isFree: z.boolean(),
    priceText: z.string().trim().max(40).optional(),
    minAge: z.number().int().min(0).max(17),
    maxAge: z.number().int().min(0).max(17),
    organiser: z.string().trim().min(2).max(80),
    sourceUrl: z.url({ protocol: /^https?$/ }),
    bookingUrl: z.url({ protocol: /^https?$/ }).optional(),
  })
  .refine((v) => v.end > v.start, { path: ["end"], message: "End must be after start" })
  .refine((v) => !v.endDate || v.endDate > v.date, { path: ["endDate"], message: "endDate must be after date" })
  .refine((v) => v.maxAge >= v.minAge, { path: ["maxAge"], message: "maxAge < minAge" });

export type ScoutedEvent = z.infer<typeof scoutedEventSchema>;
