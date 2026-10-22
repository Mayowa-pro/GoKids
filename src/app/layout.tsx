import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Link from "next/link";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Fredoka({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const body = Nunito({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, type: "website", locale: "en_GB" },
};

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M17 2c-6 0-11 4.6-11 10.5C6 20 17 32 17 32s11-12 11-19.5C28 6.6 23 2 17 2z" fill="var(--cobalt)" />
      <circle cx="17" cy="12.5" r="4.5" fill="var(--yolk)" />
      <circle cx="27" cy="6" r="3.5" fill="var(--coral)" />
    </svg>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans text-[15px] leading-relaxed">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
          Skip to content
        </a>
        <header className="sticky top-0 z-[1000] bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-cobalt">
              <Logo />
              {SITE.name}
            </Link>
            <nav className="ml-auto flex items-center gap-2 text-sm font-semibold">
              <Link href="/for-organisers" className="hidden rounded-full px-3 py-2 hover:bg-cobalt-soft sm:inline-block">
                For organisers
              </Link>
              <Link href="/submit" className="rounded-2xl bg-cobalt px-4 py-2.5 text-surface hover:opacity-90">
                List an event
              </Link>
            </nav>
          </div>
        </header>
        <main id="main" className="flex-1">{children}</main>
        <footer className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted">
            <span>© {SITE.name}. Always free for parents.</span>
            <Link href="/for-organisers" className="hover:text-ink">Boost your event</Link>
            <Link href="/submit" className="hover:text-ink">List an event</Link>
            <Link href="/admin" className="hover:text-ink">Moderation</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
