// The data layer: the only place in the app that talks to the database.
// Pages and Server Actions both call these functions, and the integration tests
// exercise them directly, so every query the app runs is tested.
// Inputs are expected to be validated already (see validation.ts). Drizzle sends
// every value as a query parameter, never pasted into the SQL text, so user input
// cannot change the query (no SQL injection, security+ :) ).

import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { requests, statusHistory, type Request, type StatusHistoryEntry } from "@/db/schema";
import type { RequestStatus, RequestType } from "./constants";
import type { CreateRequestInput } from "./validation";

export type RequestWithHistory = Request & { history: StatusHistoryEntry[] };

export type UpdateStatusResult =
  | { ok: true; request: Request }
  | { ok: false; reason: "not_found" | "unchanged" };

// Saves a new request and its first history row (none -> new) together.
export async function createRequest(input: CreateRequestInput): Promise<Request> {
  return getDb().transaction(async (tx) => {
    const [request] = await tx.insert(requests).values(input).returning();
    await tx.insert(statusHistory).values({
      requestId: request.id,
      fromStatus: null,
      toStatus: request.status,
    });
    return request;
  });
}

// Newest first. Each filter is optional; with none, every request is returned.
export async function listRequests(
  filters: { status?: RequestStatus; type?: RequestType } = {},
): Promise<Request[]> {
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(requests.status, filters.status));
  if (filters.type) conditions.push(eq(requests.type, filters.type));

  return getDb()
    .select()
    .from(requests)
    .where(and(...conditions))
    .orderBy(desc(requests.createdAt));
}

// The request plus its history (oldest first), or null if there is no such request.
export async function getRequest(id: string): Promise<RequestWithHistory | null> {
  // A malformed id can never match, and Postgres would reject it with an error.
  if (!z.uuid().safeParse(id).success) return null;

  const [request] = await getDb().select().from(requests).where(eq(requests.id, id));
  if (!request) return null;

  const history = await getDb()
    .select()
    .from(statusHistory)
    .where(eq(statusHistory.requestId, id))
    .orderBy(asc(statusHistory.changedAt));

  return { ...request, history };
}

// Changes a request's status and records the change, all in one transaction:
// either both the request and its history row are saved, or neither is.
export async function updateStatus(id: string, next: RequestStatus): Promise<UpdateStatusResult> {
  return getDb().transaction(async (tx) => {
    // FOR UPDATE locks this row until the transaction ends, so two people changing
    // the same request at once are handled one after the other, and each sees the
    // status the other one saved.
    const [current] = await tx
      .select({ status: requests.status })
      .from(requests)
      .where(eq(requests.id, id))
      .for("update");

    if (!current) return { ok: false, reason: "not_found" };
    if (current.status === next) return { ok: false, reason: "unchanged" };

    const [request] = await tx
      .update(requests)
      .set({ status: next, updatedAt: sql`now()` })
      .where(eq(requests.id, id))
      .returning();

    await tx.insert(statusHistory).values({
      requestId: id,
      fromStatus: current.status,
      toStatus: next,
    });

    return { ok: true, request };
  });
}
