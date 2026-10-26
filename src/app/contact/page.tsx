import type { Metadata } from "next";
import Link from "next/link";
import { H2, ProsePage } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Get in touch with ${SITE.name}: report a mistake, suggest a kids' event in Stoke-on-Trent, or ask about featuring your event.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const mail = (subject: string) => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;
  return (
    <ProsePage label="Contact" title="Say hello" intro="We read every message and usually reply within a couple of days.">
      <p className="rounded-tile bg-cobalt-soft p-5 text-lg">
        Email us at <a href={mail(`Hello ${SITE.name}`)}>{SITE.email}</a>
      </p>

      <H2>Parents</H2>
      <ul>
        <li>
          Spotted a mistake, or an event that&apos;s been cancelled? <a href={mail("Something's wrong on an event")}>Let us know</a> and
          include the event name.
        </li>
        <li>
          Know about something we&apos;ve missed? <a href={mail("An event you've missed")}>Send it over</a>, a link is plenty.
        </li>
      </ul>

      <H2>Organisers</H2>
      <ul>
        <li>
          The quickest way to get listed is the <Link href="/submit">add an event form</Link>. It&apos;s free.
        </li>
        <li>
          To feature your event or become a club partner, see <Link href="/for-organisers">for organisers</Link> or{" "}
          <a href={mail("Featuring my event")}>email us</a>.
        </li>
      </ul>

      <H2>Your data</H2>
      <p>
        To ask what we hold about you, or to have it removed, email us. Our <Link href="/privacy">privacy policy</Link>{" "}
        explains what we collect.
      </p>
    </ProsePage>
  );
}
