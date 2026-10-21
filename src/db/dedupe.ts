/**
 * Runs on every deploy, after new events are imported.
 * - Removes the made-up sample events once real events are live, so they can't double up with real ones.
 * - Removes listings that repeat another listing (same event, same place, same day or weekly slot),
 *   keeping the best copy: featured first, then live, then owner-supplied.
 */
import { and, count, eq, inArray } from "drizzle-orm";
import { findDuplicates } from "../lib/dedupe";
import { db } from "./index";
import { events } from "./schema";

export async function removeDuplicates(now = new Date()) {
  const [{ real }] = await db
    .select({ real: count() })
    .from(events)
    .where(and(eq(events.isSample, false), eq(events.status, "approved")));
  if (real > 0) {
    const gone = await db.delete(events).where(eq(events.isSample, true)).returning({ id: events.id });
    if (gone.length) console.log(`Removed ${gone.length} sample events now that real events are live.`);
  }

  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.isSample, false), inArray(events.status, ["approved", "pending"])));
  const ids = findDuplicates(rows, now);
  for (let i = 0; i < ids.length; i += 200) {
    await db.delete(events).where(inArray(events.id, ids.slice(i, i + 200)));
  }
  console.log(ids.length ? `Removed ${ids.length} duplicate listings.` : "No duplicate listings.");
  return ids.length;
}

if (process.argv[1]?.endsWith("dedupe.ts")) {
  removeDuplicates().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
