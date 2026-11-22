"use client";

// The only Client Component in the create flow: useActionState runs in the
// browser to show the server's validation errors and the pending state.
// The form still submits without JavaScript, because its action is a Server Action.

import { useActionState } from "react";
import { createRequestAction, type CreateRequestState } from "@/app/actions";
import {
  DESCRIPTION_MAX,
  NAME_MAX,
  PRIORITY_LABELS,
  REQUEST_PRIORITIES,
  REQUEST_TYPES,
  TITLE_MAX,
  TYPE_LABELS,
} from "@/lib/constants";

const initialState: CreateRequestState = {};

const inputClass =
  "min-h-11 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 aria-invalid:border-red-600 dark:border-neutral-700";

export function RequestForm() {
  const [state, formAction, pending] = useActionState(createRequestAction, initialState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const hasErrors = Object.keys(errors).length > 0;

  return (
    // After a failed submit, the key changes so the fields remount with what the
    // user typed.
    <form key={JSON.stringify(values)} action={formAction} className="flex flex-col gap-5" noValidate>
      <p aria-live="polite" className="text-sm font-medium text-red-700 dark:text-red-400">
        {hasErrors ? "Please fix the highlighted fields." : ""}
      </p>

      <Field id="title" label="Title" error={errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={TITLE_MAX}
          defaultValue={values.title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field id="description" label="Description" error={errors.description}>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={DESCRIPTION_MAX}
          defaultValue={values.description}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="type" label="Request type" error={errors.type}>
          <select
            id="type"
            name="type"
            defaultValue={values.type ?? ""}
            aria-invalid={Boolean(errors.type)}
            aria-describedby={errors.type ? "type-error" : undefined}
            className={inputClass}
          >
            <option value="" disabled>
              Choose a type
            </option>
            {REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="priority" label="Priority" error={errors.priority}>
          <select
            id="priority"
            name="priority"
            defaultValue={values.priority || "normal"}
            aria-invalid={Boolean(errors.priority)}
            aria-describedby={errors.priority ? "priority-error" : undefined}
            className={inputClass}
          >
            {REQUEST_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="requesterName" label="Your name" error={errors.requesterName}>
        <input
          id="requesterName"
          name="requesterName"
          type="text"
          autoComplete="name"
          maxLength={NAME_MAX}
          defaultValue={values.requesterName}
          aria-invalid={Boolean(errors.requesterName)}
          aria-describedby={errors.requesterName ? "requesterName-error" : undefined}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-md bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}

// A label, the control, and its error message, linked by id for screen readers.
// Every input has a label, and errors are announced, not just coloured red.
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-700 dark:text-red-400">
          {error[0]}
        </p>
      )}
    </div>
  );
}
