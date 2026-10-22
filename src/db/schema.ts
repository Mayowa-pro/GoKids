import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    region: text("region").notNull(),
    area: text("area").notNull(),
    venue: text("venue").notNull(),
    postcode: text("postcode"),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp" }).notNull(),
    /** Optional wording for events with several sessions, e.g. "Shows at 1pm and 5pm". */
    timesNote: text("times_note"),
    /**
     * Weekly sessions (like a library rhyme time) are stored once. startsAt/endsAt hold the first
     * session; the site works out the next one when it shows the event. repeatUntil is optional.
     */
    repeatsWeekly: integer("repeats_weekly", { mode: "boolean" }).notNull().default(false),
    repeatUntil: integer("repeat_until", { mode: "timestamp" }),
    isFree: integer("is_free", { mode: "boolean" }).notNull(),
    priceText: text("price_text"),
    /** Cheapest ticket in pence (0 = free, null = unknown), worked out from priceText, for the budget filter. */
    priceFrom: integer("price_from"),
    minAge: integer("min_age").notNull().default(0),
    maxAge: integer("max_age").notNull().default(16),
    organiser: text("organiser").notNull(),
    contactEmail: text("contact_email"),
    bookingUrl: text("booking_url"),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
    featuredUntil: integer("featured_until", { mode: "timestamp" }),
    isSample: integer("is_sample", { mode: "boolean" }).notNull().default(false),
    /** Where an imported event was found, so a moderator can check it and parents can see the original. */
    sourceUrl: text("source_url"),
    /** How it arrived: "form" (organiser), "scout" (weekly web search) or "feed" (calendar import). */
    origin: text("origin").notNull().default("form"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [
    index("events_region_start_idx").on(t.region, t.status, t.startsAt),
  ],
);

export type EventRow = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
