import type { Metadata } from "next";
import { Barlow, Oswald } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import saddledome from "../../public/images/saddledome.webp";
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
      <body className="relative isolate flex min-h-full flex-col">
        {/* Full-page background photo, fixed so it stays put while the page scrolls.
            Decorative, so the alt text is empty and screen readers skip it.
            next/image serves a resized, modern-format copy for each screen size,
            and the static import gives it a blur placeholder while it loads. */}
        <div aria-hidden className="fixed inset-0 -z-10">
          <Image
            src={saddledome}
            alt=""
            fill
            sizes="100vw"
            placeholder="blur"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-[center_60%]"
          />
          {/* Dark overlay so text placed directly on the page stays readable.
              Cards, panels and fields have their own solid backgrounds on top. */}
          <div className="absolute inset-0 bg-linear-to-b from-canvas/90 via-canvas/80 to-canvas/90" />
        </div>
        {/* The site is public and has no login, so anyone with the link can read and
            add requests. This tells visitors not to enter anything real. */}
        <div className="border-b border-gold/40 bg-canvas px-4 py-2 text-center text-sm text-gold">
          <strong className="font-semibold">Demo app.</strong> Use fake data only; do not enter
          personal information.
        </div>
        {/* A mostly solid bar rather than a backdrop blur: blurred layers often
            render the text on top of them less sharply. */}
        <header className="border-b-2 border-flame bg-canvas/85">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex flex-col leading-tight">
              <span className="font-display text-xl font-bold uppercase tracking-wider">Assist</span>
              <span className="text-sm font-medium text-muted">Digital Technology Requests</span>
            </Link>
            <Link
              href="/requests/new"
              className="inline-flex min-h-11 items-center rounded-md bg-flame px-4 text-sm font-semibold text-white hover:bg-flame/85"
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
