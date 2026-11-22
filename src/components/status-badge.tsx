import { STATUS_LABELS, type RequestStatus } from "@/lib/constants";

// Scoreboard-style tiles. The statuses differ by fill style (outline, solid,
// muted) as well as colour, and always show the word, so status is never
// conveyed by colour alone. Contrast: gold on dark 10:1, white on red 5.3:1,
// muted on raised 6.9:1.
const STYLES: Record<RequestStatus, string> = {
  new: "border-gold text-gold",
  in_progress: "border-flame bg-flame text-white",
  completed: "border-line bg-raised text-muted",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-sm border px-2 py-0.5 font-sans text-xs font-bold uppercase tracking-wider ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
