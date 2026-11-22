import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StatusBadge } from "@/components/status-badge";
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getRequest } from "@/lib/requests";
import { StatusForm } from "./status-form";

type Params = PageProps<"/requests/[id]">["params"];

export default function RequestDetailPage({ params }: PageProps<"/requests/[id]">) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/" className="self-start text-sm underline">
        ← All requests
      </Link>
      {/* The id comes from the URL and the request from the database, both at
          request time, so the details stream in behind this boundary. */}
      <Suspense fallback={<p className="text-muted">Loading request…</p>}>
        <RequestDetail params={params} />
      </Suspense>
    </div>
  );
}

async function RequestDetail({ params }: { params: Params }) {
  const { id } = await params;
  // getRequest returns null for a malformed id as well as a missing one.
  const request = await getRequest(id);
  if (!request) notFound();

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <StatusBadge status={request.status} />
        </div>
        {/* React escapes this text, so anything typed into a request is shown
            as text and can never run as HTML or script. */}
        <p className="whitespace-pre-wrap">{request.description}</p>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-md border border-line bg-surface p-4 text-sm sm:grid-cols-2">
        <Detail label="Type" value={TYPE_LABELS[request.type]} />
        <Detail label="Priority" value={PRIORITY_LABELS[request.priority]} />
        <Detail label="Requested by" value={request.requesterName} />
        <Detail label="Created" value={formatDateTime(request.createdAt)} />
        <Detail label="Last updated" value={formatDateTime(request.updatedAt)} />
      </dl>

      <section className="flex flex-col gap-3" aria-labelledby="status-heading">
        <h2 id="status-heading" className="text-lg font-semibold">
          Update status
        </h2>
        <StatusForm id={request.id} status={request.status} />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-lg font-semibold">
          History
        </h2>
        <ol className="flex flex-col gap-3 border-l-2 border-gold/50 pl-4">
          {request.history.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {entry.fromStatus === null
                  ? `Created as ${STATUS_LABELS[entry.toStatus]}`
                  : `${STATUS_LABELS[entry.fromStatus]} → ${STATUS_LABELS[entry.toStatus]}`}
              </span>
              <time dateTime={entry.changedAt.toISOString()} className="text-xs text-muted">
                {formatDateTime(entry.changedAt)}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
