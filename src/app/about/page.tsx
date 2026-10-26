import type { Metadata } from "next";
import Link from "next/link";
import { H2, ProsePage } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: `${SITE.name} gathers kids' events and family things to do in Stoke-on-Trent into one map and feed, free for parents.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ProsePage
      label="About"
      title="Every family outing near you, in one place"
      intro={`${SITE.name} helps parents in Stoke-on-Trent find things to do with their kids, without digging through dozens of Facebook groups, library pages and venue websites.`}
    >
      <H2>What you&apos;ll find here</H2>
      <p>
        Baby and toddler groups, library rhyme times, holiday crafts, theatre shows, museum days, sport taster sessions
        and big seasonal days out. Free and paid, from Tunstall to Longton and everywhere in between.
      </p>
      <ul>
        <li>See what&apos;s on today, this weekend or on any date you choose.</li>
        <li>Filter by your child&apos;s age, and slide to set your budget, from free upwards.</li>
        <li>Type your postcode to see what&apos;s closest to you on the map.</li>
      </ul>

      <H2>Where the events come from</H2>
      <p>
        Local organisers add their own events, and every week we look through council, library, museum and venue
        listings for anything new. A person checks each event before it goes on the site. Plans can change, so it&apos;s
        always worth checking with the organiser before you set off.
      </p>

      <H2>Always free for parents</H2>
      <p>
        You never pay to use {SITE.name} and you don&apos;t need an account. Organisers can list events for free too, and
        can pay a small fee to have theirs featured. Featured events are always marked with a ★.
      </p>

      <H2>Starting in Stoke-on-Trent</H2>
      <p>
        We&apos;re starting in the Potteries and plan to add more towns across the Midlands. If you run something for
        families, <Link href="/submit">add your event</Link>. If you spot a mistake or something we&apos;ve missed,{" "}
        <Link href="/contact">tell us</Link>.
      </p>
    </ProsePage>
  );
}
