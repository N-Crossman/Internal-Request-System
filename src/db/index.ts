import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// The connection is created the first time it is used, not when this file is loaded.
// `next build` loads every page's code without running any queries, so builds work
// without DATABASE_URL (CI, preview deployments). A missing DATABASE_URL still fails
// with a clear message, but only when something actually queries the database.

// One shared connection pool for the whole app. In development, Next.js reloads
// modules on every edit, which would open a new pool each time and eventually
// exhaust the database's connection limit, so the pool is kept on globalThis.
const globalForDb = globalThis as unknown as {
  pgClient?: postgres.Sql;
  db?: PostgresJsDatabase<typeof schema>;
};

export function getClient(): postgres.Sql {
  if (!globalForDb.pgClient) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
    }
    globalForDb.pgClient = postgres(url, {
      // Neon's pooled connection string (used in production) runs through a pooler
      // that does not support prepared statements.
      prepare: false,
    });
  }
  return globalForDb.pgClient;
}

export function getDb(): PostgresJsDatabase<typeof schema> {
  globalForDb.db ??= drizzle(getClient(), { schema });
  return globalForDb.db;
}
