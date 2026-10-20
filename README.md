# GoKids

Every kids' event near you, on one map. A hyper-local platform that gathers free and paid family events into one clean feed and map, so parents stop jumping between Facebook groups, Instagram pages and council websites.

Launching in **Stoke-on-Trent** (Tunstall, Burslem, Hanley, Stoke, Fenton, Longton), built to expand across the Midlands.

- **Free for parents.** No account needed to browse.
- **Paid by organisers.** Free listings for everyone; optional boosts put an event at the top of its day with a highlighted map pin.

## Features

- **Feed and map together.** Events grouped by day, with pins colour-coded free (yellow) and paid (purple). Hovering a card highlights its pin.
- **Filters in the URL.** When (today, tomorrow, this weekend, next 7 days), age band, free only and search. Every filtered view is a shareable link.
- **Distance.** Pick a nearby town, or "Use my location", to see how far each event is.
- **Organiser submissions.** A validated form with UK postcode lookup (postcodes.io) that places the pin automatically. A honeypot field stops basic spam.
- **Moderation.** A password-protected `/admin` page to approve or reject submissions and feature events for 7 days.
- **SEO.** Each event has its own page with schema.org `Event` structured data, plus a sitemap and robots.txt.
- **UK time throughout.** Days and times are grouped in Europe/London time, including across clock changes (unit tested).
- **Accessible and responsive.** Keyboard focus states, labelled controls, list/map tabs on phones, light and dark themes.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Cache Components) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | SQLite locally, [Turso](https://turso.tech) (libSQL) in production, via Drizzle ORM with migrations |
| Map | Leaflet + react-leaflet, CARTO/OpenStreetMap tiles |
| Validation | Zod |
| Tests | Vitest |
| CI | GitHub Actions: lint, typecheck, tests, build |

## Run it locally

Needs Node 22+.

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run db:setup             # creates local.db and loads sample events
npm run dev
```

Open http://localhost:3000. Sample events use real Stoke-on-Trent venues with illustrative details, dated relative to today. Re-run `npm run db:seed` to refresh them.

Other scripts: `npm test`, `npm run lint`, `npm run typecheck`, `npm run db:generate` (after changing `src/db/schema.ts`).

## Deploy (free tier)

1. Create a Turso database and copy its URL and auth token.
2. Import this repo into [Vercel](https://vercel.com/new).
3. Set `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL` in the Vercel project settings.
4. Deploy. Vercel runs the `vercel-build` script, which updates the database tables and adds sample events the first time (only if the database is empty), then builds the site.

## Project structure

```
src/
  app/
    page.tsx                 landing page and regions
    [region]/page.tsx        feed + map for a city
    events/[slug]/page.tsx   event page with structured data
    submit/                  organiser form + server action
    admin/                   moderation (approve, reject, feature)
    for-organisers/          pricing for boosts
  components/                EventsExplorer, EventMap, FilterBar, EventCard
  db/                        Drizzle schema, queries, migrations, seed
  lib/                       site config, filters, UK time, geo, validation (all unit tested)
```

Brand name and regions live in `src/lib/site.ts`. To launch a new city, add its areas there and set `live: true`.

## Roadmap

- Stripe Checkout for boosts and club partner subscriptions
- Organiser accounts so clubs can edit their own listings
- Recurring events (weekly classes) without re-submitting
- Email digest: "this weekend near you"
- Import feeds from councils and libraries
- Next regions: Newcastle-under-Lyme, Stafford, Derby, Nottingham, Birmingham
