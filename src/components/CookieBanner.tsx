"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "mlo-cookie-consent";
const OPEN_EVENT = "mlo-cookie-settings";
type Choice = "yes" | "no";

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

function saveChoice(c: Choice) {
  try {
    localStorage.setItem(KEY, c);
  } catch {
    // Storage blocked: the banner will simply ask again next visit.
  }
}

/** Loads Google Analytics. Only ever called after the visitor has said yes. */
function loadAnalytics(gaId: string) {
  if (document.getElementById("ga-script")) return;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag needs the real arguments object.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", gaId, { anonymize_ip: true });
  const s = document.createElement("script");
  s.id = "ga-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(s);
}

/** Removes Google Analytics cookies when someone changes their mind. */
function clearAnalyticsCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-3).join(".")}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}

/** Asks before any statistics cookies are set (UK PECR/GDPR). Shows nothing if analytics isn't set up. */
export function CookieBanner({ gaId }: { gaId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!gaId) return;
    const c = readChoice();
    if (c === "yes") loadAnalytics(gaId);
    // Reading the saved choice can only happen in the browser, so the banner appears after the page loads.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, [gaId]);

  if (!gaId || !open) return null;

  const choose = (c: Choice) => {
    const before = readChoice();
    saveChoice(c);
    setOpen(false);
    if (c === "yes") loadAnalytics(gaId);
    else if (before === "yes") {
      clearAnalyticsCookies();
      location.reload();
    }
  };

  return (
    <div role="dialog" aria-label="Cookie choice" className="fixed inset-x-0 bottom-0 z-[1100] p-3 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:p-0">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_8px_30px_rgba(40,20,90,0.18)]">
        <p className="font-display text-lg font-semibold">Can we count your visit? 🍪</p>
        <p className="mt-1.5 text-sm text-muted">
          With your OK we use Google Analytics cookies to see which pages families find useful. We don&apos;t use them for advertising.{" "}
          <Link href="/privacy" className="font-semibold text-cobalt underline">More about cookies</Link>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => choose("no")} className="min-h-11 rounded-2xl bg-cobalt-soft px-4 font-semibold text-cobalt hover:opacity-90">
            No thanks
          </button>
          <button type="button" onClick={() => choose("yes")} className="min-h-11 rounded-2xl bg-cobalt px-4 font-semibold text-white hover:opacity-90">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/** Lets visitors change their cookie choice later (used in the footer and Privacy page). */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className ?? "font-semibold text-cobalt underline"}>
      Change cookie settings
    </button>
  );
}
