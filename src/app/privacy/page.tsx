import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieBanner";
import { H2, ProsePage } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy and cookies",
  description: `How ${SITE.name} uses your information and cookies.`,
  alternates: { canonical: "/privacy" },
};

const UPDATED = "26 October 2026";

export default function PrivacyPage() {
  return (
    <ProsePage label="Privacy" title="Privacy and cookies" intro={`We collect as little as we can. This page explains what, why, and what you can do about it. Last updated ${UPDATED}.`}>
      <H2>Who we are</H2>
      <p>
        {SITE.name} ({SITE.url.replace(/^https?:\/\//, "")}) is a website listing family events and days out. We are the
        &ldquo;controller&rdquo; of the personal information described here under UK data protection law (UK GDPR and the
        Data Protection Act 2018). You can reach us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <H2>Parents and visitors</H2>
      <p>You can use the whole site without an account and without telling us who you are.</p>
      <ul>
        <li>
          <strong>Your postcode or location.</strong> If you use &ldquo;Find events near you&rdquo;, your postcode is sent to{" "}
          <a href="https://postcodes.io" target="_blank" rel="noopener noreferrer">postcodes.io</a> (a free UK postcode
          service) to turn it into a map position. If you share your location instead, your browser works it out and it
          never leaves your device. Either way, the position is saved only in your own browser so the site remembers it next
          time. We don&apos;t receive or store it.
        </li>
        <li>
          <strong>Maps.</strong> Map pictures are loaded from CARTO and OpenStreetMap, which see your IP address like any
          website you visit.
        </li>
        <li>
          <strong>Visitor statistics, only if you say yes.</strong> With your permission we use Google Analytics to count
          visits and see which pages are popular, so we can improve the site. It sets cookies and Google processes your IP
          address and device details, which may be stored outside the UK under Google&apos;s safeguards. We don&apos;t use it
          for advertising. If you say no, it never loads.
        </li>
      </ul>

      <H2>Organisers who add an event</H2>
      <p>
        When you add an event we keep the event details you give us, which go on the public site once approved, and your
        email address, which is never shown publicly. We use your email only to contact you about your listing. Our
        lawful basis is our legitimate interest in running accurate listings. We keep it while your event is listed and
        for up to 12 months afterwards, then delete it.
      </p>

      <H2>Events we find ourselves</H2>
      <p>
        Some events come from public pages such as council, library and venue websites. We show the organiser&apos;s name
        and public booking links only. If you&apos;d like a listing changed or removed, email us.
      </p>

      <H2>Affiliate links</H2>
      <p>
        Some links on our site are affiliate links. If you click one and book, the company you book with (or the
        affiliate network working for them, such as Awin) may set its own cookies on its website so we can be paid a small
        commission. We don&apos;t receive your name or payment details. Those cookies are covered by that company&apos;s own
        privacy policy.
      </p>

      <H2>Cookies</H2>
      <ul>
        <li>
          <strong>Needed for the site to work:</strong> a cookie that remembers your cookie choice, saved in your browser,
          and a login cookie used only by our own moderators.
        </li>
        <li>
          <strong>Optional, statistics:</strong> Google Analytics cookies (names start with <code>_ga</code>), set only if
          you choose &ldquo;Accept&rdquo;. They last up to 2 years.
        </li>
      </ul>
      <p>
        <CookieSettingsButton />
      </p>

      <H2>Who we share with</H2>
      <p>
        We don&apos;t sell your information. Our website runs on Vercel and our event database on Turso, who store data for
        us under contract. Google receives statistics data only if you accept cookies.
      </p>

      <H2>Your rights</H2>
      <p>
        You can ask to see the information we hold about you, have it corrected or deleted, or object to how we use it.
        Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. If you&apos;re unhappy with how we handle your data, you
        can complain to the Information Commissioner&apos;s Office at{" "}
        <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
      </p>
      <p>
        <Link href="/contact">Contact us</Link>
      </p>
    </ProsePage>
  );
}
