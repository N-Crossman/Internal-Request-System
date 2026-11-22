// Single source of truth for allowed values. The database enums (src/db/schema.ts)
// and the Zod validation schemas both read from here, so they cannot drift apart.

export const REQUEST_TYPES = ["support", "website_update", "new_feature", "other"] as const;
export const REQUEST_STATUSES = ["new", "in_progress", "completed"] as const;
export const REQUEST_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

// How each value is shown in the UI. Typed as Record<..., string>, so adding a
// value above without a label here is a type error.
export const TYPE_LABELS: Record<RequestType, string> = {
  support: "Support",
  website_update: "Website update",
  new_feature: "New feature",
  other: "Other",
};
export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "New",
  in_progress: "In progress",
  completed: "Completed",
};
export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

// Field length limits, enforced by the database column types and by Zod.
export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;
export const NAME_MAX = 100;
