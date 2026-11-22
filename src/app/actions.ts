"use server";

// Server Actions are public HTTP endpoints: anyone can POST to them without using
// our forms. So each one validates its input here, on the server, before calling
// the data layer.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createRequest, updateStatus } from "@/lib/requests";
import { createRequestSchema, updateStatusSchema } from "@/lib/validation";

const CREATE_FIELDS = ["title", "description", "type", "priority", "requesterName"] as const;
type CreateField = (typeof CREATE_FIELDS)[number];

export type CreateRequestState = {
  errors?: Partial<Record<CreateField, string[]>>;
  // What the user typed, so the form can refill itself after a validation error.
  values?: Partial<Record<CreateField, string>>;
};

export type UpdateStatusState = { error?: string };

// FormData values can be missing or be files; treat anything that is not text as empty.
function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function createRequestAction(
  _previous: CreateRequestState,
  formData: FormData,
): Promise<CreateRequestState> {
  const values = Object.fromEntries(CREATE_FIELDS.map((f) => [f, text(formData, f)])) as Record<
    CreateField,
    string
  >;

  const parsed = createRequestSchema.safeParse({
    ...values,
    // An unselected priority arrives as "", which should fall back to the default.
    priority: values.priority || undefined,
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const request = await createRequest(parsed.data);

  revalidatePath("/");
  // redirect() works by throwing, so it must stay outside any try/catch.
  redirect(`/requests/${request.id}`);
}

export async function updateStatusAction(
  _previous: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const parsed = updateStatusSchema.safeParse({
    id: text(formData, "id"),
    status: text(formData, "status"),
  });

  if (!parsed.success) {
    return { error: "Choose a valid status." };
  }

  const { id, status } = parsed.data;
  const result = await updateStatus(id, status);

  if (!result.ok) {
    return {
      error:
        result.reason === "unchanged"
          ? "The request already has that status."
          : "This request no longer exists.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/requests/${id}`);
  redirect(`/requests/${id}`);
}
