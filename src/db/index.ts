import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local development uses a SQLite file. In production point DATABASE_URL at Turso (libsql://…).
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };
