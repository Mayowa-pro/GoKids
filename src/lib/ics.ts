import type { PublicEvent } from "@/db/queries";
import { addDays, londonDateKey, londonMidnight } from "./time";

/** "20261103T130000" on a UK clock. */
function local(at: Date): string {
  const key = londonDateKey(at);
  const mins = Math.round((at.getTime() - londonMidnight(key).getTime()) / 60_000);
  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");
  return `${key.replace(/-/g, "")}T${hh}${mm}00`;
}

/** Calendar text escapes commas, semicolons and new lines. */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");

/** Lines longer than 75 characters are folded, as the calendar format asks. */
const fold = (line: string) => line.match(/.{1,73}/g)!.join("\r\n ");

const LONDON = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/London",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0000",
  "TZOFFSETTO:+0100",
  "TZNAME:BST",
  "DTSTART:19700329T010000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0000",
  "TZNAME:GMT",
  "DTSTART:19701025T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/**
 * An "add to calendar" file for one event. Weekly sessions repeat every week; events that run
 * over several days (like a weekend show) repeat each day at the same times.
 */
export function eventToIcs(e: PublicEvent, pageUrl: string, now = new Date()): string {
  const startKey = londonDateKey(e.startsAt);
  const endKey = londonDateKey(e.endsAt);
  let end = e.endsAt;
  let rule: string | null = null;
  if (e.repeatsWeekly) {
    rule = "RRULE:FREQ=WEEKLY" + (e.repeatUntil ? `;UNTIL=${local(e.repeatUntil).slice(0, 8)}T235959` : "");
  } else if (startKey !== endKey) {
    // Same times each day, until the last day.
    const endMins = e.endsAt.getTime() - londonMidnight(endKey).getTime();
    end = new Date(londonMidnight(startKey).getTime() + endMins);
    if (end <= e.startsAt) end = new Date(londonMidnight(addDays(startKey, 1)).getTime() + endMins);
    rule = `RRULE:FREQ=DAILY;UNTIL=${endKey.replace(/-/g, "")}T235959`;
  }
  const where = [e.venue, e.postcode].filter(Boolean).join(", ");
  const price = e.isFree ? "Free" : (e.priceText ?? "Paid");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//My Little Outings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...LONDON,
    "BEGIN:VEVENT",
    `UID:${e.slug}@mylittleoutings.co.uk`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
    `DTSTART;TZID=Europe/London:${local(e.startsAt)}`,
    `DTEND;TZID=Europe/London:${local(end)}`,
    ...(rule ? [rule] : []),
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(where)}`,
    `DESCRIPTION:${esc(`${price}. Ages ${e.minAge} to ${e.maxAge}. ${e.description}\n\nCheck with the organiser before you go: ${e.bookingUrl ?? pageUrl}`)}`,
    `URL:${pageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
