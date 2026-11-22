import type { Metadata } from "next";
import { RequestForm } from "./request-form";

export const metadata: Metadata = { title: "New request" };

export default function NewRequestPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">New request</h1>
        <p className="text-sm text-neutral-500">
          Tell the Digital Technology team what you need. All fields are required except priority.
        </p>
      </div>
      <RequestForm />
    </div>
  );
}
