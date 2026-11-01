import { connection } from "next/server";
import { getEventBySlug } from "@/db/queries";
import { eventToIcs } from "@/lib/ics";
import { SITE } from "@/lib/site";

/** "Add to calendar": a small calendar file that phones open in their calendar app. */
export async function GET(_req: Request, ctx: RouteContext<"/events/[slug]/calendar">) {
  await connection();
  const { slug } = await ctx.params;
  const e = await getEventBySlug(slug);
  if (!e) return new Response("Event not found", { status: 404 });
  return new Response(eventToIcs(e, `${SITE.url}/events/${e.slug}`), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug.slice(0, 60)}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
