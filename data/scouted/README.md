# Scouted events

The weekly AI scout saves events it finds here as JSON files, one per week (for example `2026-10-27.json`).
On every deploy, `npm run db:import` adds new ones to the moderation queue as **pending**. Nothing goes live until it's approved at `/admin`.

Each file is a list of events in this shape:

```json
[
  {
    "title": "Half-term Family Trail",
    "description": "Written in our own words, not copied from the source.",
    "category": "Museums",
    "area": "hanley",
    "venue": "Potteries Museum & Art Gallery",
    "postcode": "ST1 3DW",
    "date": "2026-10-27",
    "start": "10:00",
    "end": "16:00",
    "isFree": true,
    "minAge": 4,
    "maxAge": 11,
    "organiser": "Potteries Museum & Art Gallery",
    "sourceUrl": "https://example.org/whats-on/half-term-trail"
  }
]
```

**One listing per event, not per session:**
- An event that runs every day over a date range (like a half-term trail) is one entry with `"endDate"` set to the last day.
- Several sessions on the same day go in one entry: `start` is the first session, `end` the last, and `"timesNote"` says it plainly, for example `"Two sessions: 5:30–7pm and 7:30–9pm"`.
- A session that runs every week on the same day and time is one entry with `"repeatsWeekly": true` and `date` set to any one session (optional `"repeatUntil"` for the last date). The site shows the next session automatically.
- Only repeat an event when it happens on separate, non-consecutive days.

Allowed `category` values and `area` slugs are in `src/lib/site.ts`. Paid events add `"priceText": "£5 per child"`.
