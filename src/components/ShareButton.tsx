"use client";

/**
 * "Send to a friend": uses the phone's own share menu where there is one,
 * and WhatsApp otherwise (most parents share plans there).
 */
export function ShareButton({ title, url, className }: { title: string; url: string; className?: string }) {
  const text = `${title}: ${url}`;
  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(ev) => {
        if (typeof navigator !== "undefined" && "share" in navigator) {
          ev.preventDefault();
          navigator.share({ title, url }).catch(() => {});
        }
      }}
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12M7 8l5-5 5 5" />
        <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      </svg>
      Send to a friend
    </a>
  );
}
