import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

// One shared connection pool for the whole app. In development, Next.js reloads
// modules on every edit, which would open a new pool each time and eventually
// exhaust the database's connection limit, so the pool is kept on globalThis.
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

const client =
  globalForDb.pgClient ??
  postgres(url, {
    // Neon's pooled connection string (used in production) runs through a pooler
    // that does not support prepared statements.
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export { client };
