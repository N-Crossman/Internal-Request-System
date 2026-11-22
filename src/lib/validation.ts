import { z } from "zod";
import {
  DESCRIPTION_MAX,
  NAME_MAX,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  REQUEST_TYPES,
  TITLE_MAX,
} from "./constants";

// Every write is checked here on the server. The form's own checks are only a
// convenience: anyone can call a Server Action directly and skip the form.

export const createRequestSchema = z.object({
  // trim() runs before min(), so a title of only spaces counts as empty.
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer`),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(DESCRIPTION_MAX, `Description must be ${DESCRIPTION_MAX} characters or fewer`),
  type: z.enum(REQUEST_TYPES, "Choose a request type"),
  priority: z.enum(REQUEST_PRIORITIES, "Choose a valid priority").default("normal"),
  requesterName: z
    .string()
    .trim()
    .min(1, "Your name is required")
    .max(NAME_MAX, `Name must be ${NAME_MAX} characters or fewer`),
});

export const updateStatusSchema = z.object({
  id: z.uuid("Invalid request id"),
  status: z.enum(REQUEST_STATUSES, "Choose a valid status"),
});

// Types inferred from the schemas, so the validation and the TypeScript types
// cannot disagree. CreateRequestInput is the cleaned output: trimmed, with priority filled in.
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
