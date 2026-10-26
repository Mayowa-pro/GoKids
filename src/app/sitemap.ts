import type { MetadataRoute } from "next";
import { listUpcomingSlugs } from "@/db/queries";
import { LIVE_REGIONS, SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await listUpcomingSlugs();
  return [
    { url: SITE.url, changeFrequency: "daily" as const, priority: 1 },
    { url: `${SITE.url}/for-organisers` },
    { url: `${SITE.url}/about` },
    { url: `${SITE.url}/contact` },
    { url: `${SITE.url}/privacy` },
    ...LIVE_REGIONS.map((r) => ({ url: `${SITE.url}/${r.slug}`, changeFrequency: "daily" as const })),
    ...events.map((e) => ({ url: `${SITE.url}/events/${e.slug}` })),
  ];
}
