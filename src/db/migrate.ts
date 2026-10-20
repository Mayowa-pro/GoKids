import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index";

migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => console.log("Database is up to date."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
