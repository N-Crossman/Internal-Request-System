import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

// Integration tests clear tables, so they only run against a throwaway database
// named in TEST_DATABASE_URL (set in CI). They never fall back to DATABASE_URL,
// and they refuse to run against Neon, where the real data lives.
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (testDatabaseUrl?.includes("neon.tech")) {
  throw new Error("TEST_DATABASE_URL points at Neon. Integration tests wipe tables; use a throwaway database.");
}

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Without a test database, skip integration tests and run unit tests only.
    exclude: testDatabaseUrl
      ? configDefaults.exclude
      : [...configDefaults.exclude, "src/**/*.integration.test.ts"],
    // The app's db client reads DATABASE_URL; in tests it only ever sees the test database.
    env: { DATABASE_URL: testDatabaseUrl ?? "" },
    // Integration tests share one database, so test files run one after another.
    fileParallelism: false,
  },
});
