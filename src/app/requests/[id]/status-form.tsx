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
            className="min-h-11 rounded-md border border-line bg-raised px-3"
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
          className="min-h-11 rounded-md bg-flame px-4 text-sm font-semibold text-white hover:bg-flame/85 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save status"}
        </button>
      </div>
      <p id="status-error" aria-live="polite" className="text-sm text-flame-ink">
        {state.error ?? ""}
      </p>
    </form>
  );
}
