import type { Metadata } from "next";
import { Barlow, Oswald } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// next/font downloads these at build time and serves them from our own domain:
// no request to Google from the browser, and no layout jump while fonts load.
// Both are under the SIL Open Font License.

// Bold condensed face for headings, for a scoreboard feel.
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

// Clean, slightly sporty face for body text.
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Assist", template: "%s · Assist" },
  description: "Submit and track requests for the Digital Technology team.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${oswald.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex flex-col leading-tight">
              <span className="text-lg font-bold">Assist</span>
              <span className="text-xs text-neutral-500">Digital Technology Requests</span>
            </Link>
            <Link
              href="/requests/new"
              className="inline-flex min-h-11 items-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              New request
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
