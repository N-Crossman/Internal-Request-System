import Link from "next/link";

// Shown when the detail page calls notFound(): the id is malformed, or no request has that id.
export default function RequestNotFound() {
  return (
    <div className="flex max-w-xl flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Request not found</h1>
      <p className="text-muted">
        This request does not exist. Check the link, or find it in the list.
      </p>
      <Link href="/" className="text-sm underline">
        Back to all requests
      </Link>
    </div>
  );
}
