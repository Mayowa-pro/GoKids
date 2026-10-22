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

/** Rainbow with a heart underneath, as designed by Mayowa in the logo playground. */
function Logo() {
  const stripes = [
    ["#FF6B6B", 42.44],
    ["#FFD23F", 35.31],
    ["#4CC9A0", 28.18],
    ["#5B9BFF", 21.05],
  ] as const;
  return (
    <svg width="88" height="48" viewBox="2 10 96 52" aria-hidden="true">
      {stripes.map(([c, r]) => (
        <path key={c} d={`M${50 - r} 58 A${r} ${r} 0 0 1 ${50 + r} 58`} fill="none" stroke={c} strokeWidth="7.13" />
      ))}
      <path transform="translate(50,54) scale(0.667)" d="M0 12 C-14 3 -15 -7 -10 -11 C-6 -14 -1 -12 0 -7 C1 -12 6 -14 10 -11 C15 -7 14 3 0 12Z" fill="#FF6B6B" />
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
            <Link href="/" aria-label={SITE.name} className="flex items-end gap-2 font-display font-bold">
              <Logo />
              {/* "Outings" sits level with the bottom of the rainbow, with "Little" tucked just above it. */}
              <span className="flex flex-col pb-0.5 leading-none">
                <span className="-mb-1 text-lg text-coral">Little</span>
                <span className="text-[25px] text-cobalt">Outings</span>
              </span>
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
