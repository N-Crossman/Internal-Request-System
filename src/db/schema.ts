import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import {
  NAME_MAX,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  REQUEST_TYPES,
  TITLE_MAX,
} from "../lib/constants";

// Postgres enums: the database itself rejects any value not in these lists.
export const requestType = pgEnum("request_type", REQUEST_TYPES);
export const requestStatus = pgEnum("request_status", REQUEST_STATUSES);
export const requestPriority = pgEnum("request_priority", REQUEST_PRIORITIES);

export const requests = pgTable(
  "requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: TITLE_MAX }).notNull(),
    description: text("description").notNull(),
    type: requestType("type").notNull(),
    status: requestStatus("status").notNull().default("new"),
    priority: requestPriority("priority").notNull().default("normal"),
    requesterName: varchar("requester_name", { length: NAME_MAX }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // The list page filters on these two columns.
    index("requests_status_idx").on(t.status),
    index("requests_type_idx").on(t.type),
  ],
);

export const statusHistory = pgTable(
  "status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    // Null on the first row, when the request is created and has no previous status.
    fromStatus: requestStatus("from_status"),
    toStatus: requestStatus("to_status").notNull(),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // The detail page looks up history by request.
    index("status_history_request_id_idx").on(t.requestId),
  ],
);

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
export type StatusHistoryEntry = typeof statusHistory.$inferSelect;
