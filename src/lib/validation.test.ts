import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DESCRIPTION_MAX, NAME_MAX, TITLE_MAX } from "./constants";
import { createRequestSchema, updateStatusSchema } from "./validation";

const valid = {
  title: "Game night ticket banner update",
  description: "Swap the homepage banner for Saturday's game night.",
  type: "website_update",
  priority: "high",
  requesterName: "Priya S.",
};

// Returns the error messages for one field, or undefined if that field passed.
function errorsFor(input: unknown, field: string) {
  const result = createRequestSchema.safeParse(input);
  if (result.success) return undefined;
  const messages = result.error.issues
    .filter((issue) => issue.path[0] === field)
    .map((issue) => issue.message);
  return messages.length ? messages : undefined;
}

describe("createRequestSchema", () => {
  it("accepts a valid request", () => {
    assert.equal(createRequestSchema.safeParse(valid).success, true);
  });

  it("trims whitespace from text fields", () => {
    const result = createRequestSchema.parse({
      ...valid,
      title: "  Padded title  ",
      requesterName: "  Priya S.  ",
    });
    assert.equal(result.title, "Padded title");
    assert.equal(result.requesterName, "Priya S.");
  });

  it("defaults priority to normal when it is missing", () => {
    const withoutPriority: Record<string, unknown> = { ...valid };
    delete withoutPriority.priority;
    assert.equal(createRequestSchema.parse(withoutPriority).priority, "normal");
  });

  it("rejects an empty title", () => {
    assert.deepEqual(errorsFor({ ...valid, title: "" }, "title"), ["Title is required"]);
  });

  it("rejects a title that is only spaces", () => {
    assert.deepEqual(errorsFor({ ...valid, title: "     " }, "title"), ["Title is required"]);
  });

  it("rejects a missing description and requester name", () => {
    assert.ok(errorsFor({ ...valid, description: "" }, "description"));
    assert.ok(errorsFor({ ...valid, requesterName: "" }, "requesterName"));
  });

  it("rejects a request type that is not in the list", () => {
    assert.deepEqual(errorsFor({ ...valid, type: "complaint" }, "type"), [
      "Choose a request type",
    ]);
  });

  it("rejects a priority that is not in the list", () => {
    assert.deepEqual(errorsFor({ ...valid, priority: "critical" }, "priority"), [
      "Choose a valid priority",
    ]);
  });

  it("enforces the length limits, and allows exactly the limit", () => {
    assert.equal(errorsFor({ ...valid, title: "a".repeat(TITLE_MAX) }, "title"), undefined);
    assert.ok(errorsFor({ ...valid, title: "a".repeat(TITLE_MAX + 1) }, "title"));
    assert.ok(errorsFor({ ...valid, description: "a".repeat(DESCRIPTION_MAX + 1) }, "description"));
    assert.ok(errorsFor({ ...valid, requesterName: "a".repeat(NAME_MAX + 1) }, "requesterName"));
  });
});

describe("updateStatusSchema", () => {
  const id = "3f2b8c1e-5d4a-4b6f-9c7e-1a2b3c4d5e6f";

  it("accepts a uuid and a valid status", () => {
    assert.equal(updateStatusSchema.safeParse({ id, status: "in_progress" }).success, true);
  });

  it("rejects an id that is not a uuid", () => {
    assert.equal(updateStatusSchema.safeParse({ id: "1", status: "completed" }).success, false);
  });

  it("rejects a status that is not in the list", () => {
    assert.equal(updateStatusSchema.safeParse({ id, status: "done" }).success, false);
  });
});
