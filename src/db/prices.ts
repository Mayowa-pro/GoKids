/** Fills in "price from" for events added before the budget filter existed. Safe to run on every deploy. */
import { and, eq, isNull } from "drizzle-orm";
import { priceFromText } from "../lib/price";
import { db } from "./index";
import { events } from "./schema";

export async function fillPrices() {
  const rows = await db
    .select({ id: events.id, isFree: events.isFree, priceText: events.priceText })
    .from(events)
    .where(isNull(events.priceFrom));
  let filled = 0;
  for (const r of rows) {
    const p = priceFromText(r.isFree, r.priceText);
    if (p === null) continue;
    await db.update(events).set({ priceFrom: p }).where(and(eq(events.id, r.id), isNull(events.priceFrom)));
    filled++;
  }
  if (filled) console.log(`Worked out prices for ${filled} events.`);
  // Free events are free for adults too, unless a listing says otherwise.
  const adults = await db.update(events).set({ adultPrice: "Free" }).where(and(eq(events.isFree, true), isNull(events.adultPrice))).returning({ id: events.id });
  if (adults.length) console.log(`Marked ${adults.length} free events as free for adults.`);
}
