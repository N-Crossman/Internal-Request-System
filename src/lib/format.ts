// Dates are stored in UTC. They are formatted on the server with a fixed locale
// and time zone, so the output never depends on the server's own settings and
// the server and browser can never disagree (no hydration mismatch).
const dateTime = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Edmonton",
});

const dateOnly = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeZone: "America/Edmonton",
});

export function formatDateTime(date: Date): string {
  return dateTime.format(date);
}

export function formatDate(date: Date): string {
  return dateOnly.format(date);
}
