// Single source of truth for allowed values. The database enums (src/db/schema.ts)
// and the Zod validation schemas both read from here, so they cannot drift apart.

export const REQUEST_TYPES = ["support", "website_update", "new_feature", "other"] as const;
export const REQUEST_STATUSES = ["new", "in_progress", "completed"] as const;
export const REQUEST_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

// Field length limits, enforced by the database column types and by Zod.
export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;
export const NAME_MAX = 100;
