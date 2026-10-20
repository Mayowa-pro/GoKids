import type { Metadata } from "next";
import { LIVE_REGIONS } from "@/lib/site";
import { SubmitForm } from "./SubmitForm";

export const metadata: Metadata = { title: "List your event", description: "Add your kids' event to the map. Free listings, checked by a person before they go live." };

export default function SubmitPage() {
  const areas = LIVE_REGIONS.flatMap((r) => r.areas);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">List your event</h1>
      <p className="mb-8 mt-2 text-muted">
        Free for clubs, classes, libraries and venues. We check every listing before it goes live, usually within a day.
      </p>
      <SubmitForm areas={areas} />
    </div>
  );
}
