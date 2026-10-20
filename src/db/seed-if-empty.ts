/** Used on deploy: loads sample events only if the database has no events yet. */
import { count } from "drizzle-orm";
import { db } from "./index";
import { events } from "./schema";
import { buildSamples } from "./seed";

async function main() {
  const [{ n }] = await db.select({ n: count() }).from(events);
  if (n > 0) return console.log(`Database has ${n} events; not adding samples.`);
  const rows = buildSamples();
  await db.insert(events).values(rows);
  console.log(`Added ${rows.length} sample events.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
