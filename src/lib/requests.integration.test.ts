// Integration tests: the data layer against a real Postgres.
// These tests empty the tables before every test, so they only ever run against a
// throwaway database named in TEST_DATABASE_URL (CI sets it). Without it they are
// skipped, and they refuse to run against Neon, where the real data lives.

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, describe, it } from "node:test";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (testDatabaseUrl?.includes("neon.tech")) {
  throw new Error("TEST_DATABASE_URL points at Neon. These tests wipe tables; use a throwaway database.");
}

const base = {
  title: "Season ticket portal login issue",
  description: "Season ticket holders are sent back to the login page.",
  type: "support" as const,
  priority: "high" as const,
  requesterName: "Marcus T.",
};

describe("data layer", { skip: !testDatabaseUrl && "TEST_DATABASE_URL is not set" }, () => {
  // Loaded in before(), after DATABASE_URL points at the test database, so the
  // app's database client can only ever connect there.
  let lib: typeof import("./requests");
  let client: typeof import("@/db").client;

  before(async () => {
    process.env.DATABASE_URL = testDatabaseUrl;
    ({ client } = await import("@/db"));
    lib = await import("./requests");
  });

  beforeEach(async () => {
    await client`truncate table status_history, requests`;
  });

  after(async () => {
    await client.end();
  });

  // Reads the history straight from the database, independent of the code under test.
  async function historyCount(requestId: string) {
    const [{ count }] = await client`
      select count(*)::int as count from status_history where request_id = ${requestId}`;
    return count as number;
  }

  it("creates a request that starts as new with one history row", async () => {
    const created = await lib.createRequest({ ...base, priority: "normal" });
    const found = await lib.getRequest(created.id);

    assert.ok(found);
    assert.equal(found.title, base.title);
    assert.equal(found.status, "new");
    assert.equal(found.priority, "normal");
    assert.equal(found.history.length, 1);
    assert.equal(found.history[0].fromStatus, null);
    assert.equal(found.history[0].toStatus, "new");
  });

  it("changes the status and records where it came from and went to", async () => {
    const created = await lib.createRequest(base);

    const result = await lib.updateStatus(created.id, "in_progress");
    assert.equal(result.ok, true);

    const found = await lib.getRequest(created.id);
    assert.ok(found);
    assert.equal(found.status, "in_progress");
    assert.ok(found.updatedAt >= created.updatedAt);
    assert.equal(found.history.length, 2);
    assert.equal(found.history[1].fromStatus, "new");
    assert.equal(found.history[1].toStatus, "in_progress");
  });

  it("allows a completed request to be reopened", async () => {
    const created = await lib.createRequest(base);
    await lib.updateStatus(created.id, "completed");

    const result = await lib.updateStatus(created.id, "in_progress");
    assert.equal(result.ok, true);
    assert.equal(await historyCount(created.id), 3);
  });

  it("rejects a change to the same status and writes nothing", async () => {
    const created = await lib.createRequest(base);

    const result = await lib.updateStatus(created.id, "new");
    assert.deepEqual(result, { ok: false, reason: "unchanged" });

    const found = await lib.getRequest(created.id);
    assert.ok(found);
    assert.equal(found.status, "new");
    assert.equal(found.updatedAt.getTime(), created.updatedAt.getTime());
    assert.equal(await historyCount(created.id), 1);
  });

  it("returns null or not_found for a request that does not exist", async () => {
    assert.equal(await lib.getRequest(randomUUID()), null);
    assert.equal(await lib.getRequest("not-a-uuid"), null);
    assert.deepEqual(await lib.updateStatus(randomUUID(), "completed"), {
      ok: false,
      reason: "not_found",
    });
  });

  it("filters by status and type, newest first", async () => {
    const first = await lib.createRequest({ ...base, title: "First", type: "support" });
    const second = await lib.createRequest({ ...base, title: "Second", type: "support" });
    const third = await lib.createRequest({ ...base, title: "Third", type: "new_feature" });
    await lib.updateStatus(second.id, "completed");

    const all = await lib.listRequests();
    assert.deepEqual(
      all.map((r) => r.id),
      [third.id, second.id, first.id],
    );

    const support = await lib.listRequests({ type: "support" });
    assert.deepEqual(support.map((r) => r.id), [second.id, first.id]);

    const completed = await lib.listRequests({ status: "completed" });
    assert.deepEqual(completed.map((r) => r.id), [second.id]);

    const newSupport = await lib.listRequests({ status: "new", type: "support" });
    assert.deepEqual(newSupport.map((r) => r.id), [first.id]);
  });

  it("rolls back the status change if saving the history row fails", async () => {
    const created = await lib.createRequest(base);

    // Make every insert into status_history fail, to simulate an error halfway
    // through the transaction (after the request row has already been updated).
    await client`
      create function fail_history_insert() returns trigger language plpgsql
      as $$ begin raise exception 'forced failure for test'; end $$`;
    await client`
      create trigger fail_history before insert on status_history
      for each row execute function fail_history_insert()`;

    try {
      await assert.rejects(lib.updateStatus(created.id, "completed"), (error) => {
        // Drizzle wraps database errors in its own "Failed query" error and keeps
        // the original Postgres error as the cause.
        assert.ok(error instanceof Error);
        assert.match(String((error.cause as Error | undefined)?.message), /forced failure/);
        return true;
      });
    } finally {
      await client`drop trigger fail_history on status_history`;
      await client`drop function fail_history_insert`;
    }

    // The status update ran before the failing insert, but the transaction undid it.
    const found = await lib.getRequest(created.id);
    assert.ok(found);
    assert.equal(found.status, "new");
    assert.equal(await historyCount(created.id), 1);
  });
});
