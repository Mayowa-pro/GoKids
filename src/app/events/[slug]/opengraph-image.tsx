import { getEventBySlug } from "@/db/queries";
import { OG_SIZE, shareImage } from "@/lib/og";
import { formatLongDate, isMultiDay } from "@/lib/time";

export const alt = "Event on My Little Outings";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEventBySlug((await params).slug);
  if (!e) return shareImage({ title: "Things to do with kids, all in one place" });
  const when = isMultiDay(e) ? `${formatLongDate(e.startsAt)} to ${formatLongDate(e.endsAt)}` : formatLongDate(e.startsAt);
  const price = e.isFree ? "Free" : (e.priceText ?? "Paid");
  return shareImage({ kicker: when, title: e.title, footer: `${e.venue} · ${price}` });
}
