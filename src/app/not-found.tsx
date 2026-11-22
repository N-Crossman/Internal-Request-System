import Link from "next/link";

// Any URL that does not match a page.
export default function NotFound() {
  return (
    <div className="flex max-w-xl flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-neutral-500">There is no page at this address.</p>
      <Link href="/" className="text-sm underline">
        Back to all requests
      </Link>
    </div>
  );
}
