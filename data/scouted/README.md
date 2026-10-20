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

Allowed `category` values and `area` slugs are in `src/lib/site.ts`. Paid events add `"priceText": "£5 per child"`.
