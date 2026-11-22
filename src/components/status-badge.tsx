import { STATUS_LABELS, type RequestStatus } from "@/lib/constants";

const STYLES: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  in_progress: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  completed: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
};

// Always shows the word as well as the colour, so status is never conveyed by colour alone.
export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
