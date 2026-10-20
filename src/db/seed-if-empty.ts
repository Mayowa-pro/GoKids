/**
 * Used on deploy.
 * - Empty database: loads the sample events so the site doesn't look bare.
 * - Samples still present: replaces them with a fresh set dated from today.
 * - Samples removed at /admin: leaves things alone, so they never come back.
 */
import { count, eq } from "drizzle-orm";
import { db } from "./index";
import { events } from "./schema";
import { buildSamples } from "./seed";

async function main() {
  const [{ n }] = await db.select({ n: count() }).from(events);
  const [{ samples }] = await db.select({ samples: count() }).from(events).where(eq(events.isSample, true));
  if (n > 0 && samples === 0) return console.log("No sample events to refresh.");
  if (samples > 0) await db.delete(events).where(eq(events.isSample, true));
  const rows = buildSamples();
  await db.insert(events).values(rows);
  console.log(`Loaded ${rows.length} sample events.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
