"use client";

import { useActionState } from "react";
import { updateStatusAction, type UpdateStatusState } from "@/app/actions";
import { REQUEST_STATUSES, STATUS_LABELS, type RequestStatus } from "@/lib/constants";

const initialState: UpdateStatusState = {};

export function StatusForm({ id, status }: { id: string; status: RequestStatus }) {
  const [state, formAction, pending] = useActionState(updateStatusAction, initialState);

  return (
    // Keyed on the current status, so after a successful change the dropdown
    // resets to show the new status.
    <form key={status} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue={status}
            aria-describedby={state.error ? "status-error" : undefined}
            className="min-h-11 rounded-md border border-neutral-300 bg-transparent px-3 dark:border-neutral-700"
          >
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {pending ? "Saving…" : "Save status"}
        </button>
      </div>
      <p id="status-error" aria-live="polite" className="text-sm text-red-700 dark:text-red-400">
        {state.error ?? ""}
      </p>
    </form>
  );
}
