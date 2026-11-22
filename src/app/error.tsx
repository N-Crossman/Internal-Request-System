"use client"; // Error boundaries must be Client Components.

import Link from "next/link";
import { useEffect } from "react";

// Shown when something fails unexpectedly, for example the database being
// unreachable. It never shows the error itself: no stack traces, SQL or
// connection details reach the browser. The details go to the console instead.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex max-w-xl flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-neutral-500">
        We could not load this page. Please try again in a moment.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="min-h-11 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Try again
        </button>
        <Link href="/" className="min-h-11 content-center px-2 text-sm underline">
          Back to all requests
        </Link>
      </div>
    </div>
  );
}
