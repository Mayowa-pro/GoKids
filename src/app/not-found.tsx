import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="font-display text-3xl font-extrabold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted">The event may have finished or been removed.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-cobalt px-5 py-2.5 font-semibold text-surface">
        See what&apos;s on
      </Link>
    </div>
  );
}
