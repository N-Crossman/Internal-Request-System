import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/status-badge";
import {
  PRIORITY_LABELS,
  REQUEST_STATUSES,
  REQUEST_TYPES,
  STATUS_LABELS,
  TYPE_LABELS,
  type RequestStatus,
  type RequestType,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { listRequests } from "@/lib/requests";

type SearchParams = PageProps<"/">["searchParams"];

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Requests</h1>
      {/* The list reads the URL and the database at request time, so it streams in
          behind this boundary while the heading is sent straight away. */}
      <Suspense fallback={<p className="text-neutral-500">Loading requests…</p>}>
        <RequestList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Keeps a filter only if it is one of the allowed values; anything else
// (a typo, an old link, a hand-edited URL) is ignored rather than causing an error.
function pick<T extends string>(allowed: readonly T[], value: string | string[] | undefined) {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

async function RequestList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = pick<RequestStatus>(REQUEST_STATUSES, params.status);
  const type = pick<RequestType>(REQUEST_TYPES, params.type);

  const requests = await listRequests({ status, type });
  const filtered = Boolean(status || type);

  return (
    <>
      {/* A plain GET form: the filters live in the URL, so refresh, the back
          button and sharing a filtered view all work, with no client-side state. */}
      <form className="flex flex-wrap items-end gap-3" action="/">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Status
          <select name="status" defaultValue={status ?? ""} className={selectClass}>
            <option value="">All statuses</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Type
          <select name="type" defaultValue={type ?? ""} className={selectClass}>
            <option value="">All types</option>
            {REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Apply filters
        </button>
        {filtered && (
          <Link href="/" className="min-h-11 content-center px-2 text-sm underline">
            Clear filters
          </Link>
        )}
      </form>

      <p className="text-sm text-neutral-500" aria-live="polite">
        {requests.length} {requests.length === 1 ? "request" : "requests"}
      </p>

      {requests.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
          {filtered ? "No requests match these filters." : "No requests yet."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                href={`/requests/${request.id}`}
                className="flex flex-col gap-2 rounded-md border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold">{request.title}</span>
                  <StatusBadge status={request.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                  <span>{TYPE_LABELS[request.type]}</span>
                  <span>{PRIORITY_LABELS[request.priority]} priority</span>
                  <span>{request.requesterName}</span>
                  <span>{formatDate(request.createdAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const selectClass =
  "min-h-11 rounded-md border border-neutral-300 bg-transparent px-3 dark:border-neutral-700";
