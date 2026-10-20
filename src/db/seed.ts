/**
 * Sample listings at real Stoke-on-Trent venues. Event details are illustrative.
 * Dates are relative to today so the site always has something on.
 * Run with: npm run db:seed
 */
import { eq } from "drizzle-orm";
import { addDays, londonDateKey, londonMidnight } from "../lib/time";
import { slugify } from "../lib/slug";
import { db } from "./index";
import { events, type NewEvent } from "./schema";

type Sample = {
  t: string; v: string; area: string; pc: string; lat: number; lng: number;
  d: number; s: string; e: string; price: string | null; a: [number, number];
  c: string; org: string; desc: string; feat?: boolean; weekly?: boolean; url?: string;
};

const SAMPLES: Sample[] = [
  { t: "Toddler Stay & Play", v: "Tunstall Library & Children's Centre", area: "tunstall", pc: "ST6 5JD", lat: 53.0605, lng: -2.2105, d: 0, s: "09:30", e: "11:00", price: null, a: [0, 4], c: "Play", org: "Tunstall Family Hub", weekly: true, desc: "Soft play, sensory toys and a brew for grown-ups. Drop in any time, no booking needed." },
  { t: "Story Time & Rhymes", v: "Hanley Library", area: "hanley", pc: "ST1 3RS", lat: 53.0258, lng: -2.176, d: 1, s: "10:30", e: "11:15", price: null, a: [0, 5], c: "Stories", org: "Stoke Libraries", weekly: true, desc: "Songs, rhymes and a picture book every week in the children's corner. Free, just turn up." },
  { t: "Clay Monsters Workshop", v: "Middleport Pottery", area: "burslem", pc: "ST6 3PE", lat: 53.0478, lng: -2.2078, d: 2, s: "13:00", e: "15:00", price: "£8 per child", a: [5, 11], c: "Arts & crafts", org: "Middleport Pottery", feat: true, desc: "Kids make a clay monster with a real potter in the workshop where the Great Pottery Throw Down is filmed. Take it home after firing. Aprons provided." },
  { t: "Junior parkrun", v: "Hanley Park", area: "hanley", pc: "ST4 1EL", lat: 53.018, lng: -2.182, d: 5, s: "09:00", e: "09:45", price: null, a: [4, 14], c: "Sport", org: "parkrun volunteers", weekly: true, url: "https://www.parkrun.org.uk/", desc: "A free, timed 2k run every Sunday morning. Register once online and bring your barcode." },
  { t: "Museum Explorers: Spitfire Day", v: "Potteries Museum & Art Gallery", area: "hanley", pc: "ST1 3DW", lat: 53.0242, lng: -2.1735, d: 4, s: "11:00", e: "15:00", price: null, a: [5, 12], c: "Museums", org: "Potteries Museum", desc: "See Reginald Mitchell's Spitfire up close, then build and fly a paper glider. Family trail sheets at the desk." },
  { t: "Bottle Kiln Ghost Trail", v: "Gladstone Pottery Museum", area: "longton", pc: "ST3 1PQ", lat: 52.9874, lng: -2.13, d: 6, s: "16:00", e: "19:00", price: "£6.50 per child", a: [6, 14], c: "Museums", org: "Gladstone Pottery Museum", feat: true, desc: "A torch-lit half-term trail through the bottle kilns with spooky stories of the old potbank. Not too scary. Costumes welcome." },
  { t: "Messy Play Mornings", v: "Fenton Community Centre", area: "fenton", pc: "ST4 3BT", lat: 52.9998, lng: -2.158, d: 1, s: "10:00", e: "11:30", price: "£4 per child", a: [1, 4], c: "Play", org: "Little Splodges", weekly: true, desc: "Gloop, paint and foam in a room you don't have to clean. Bring a change of clothes." },
  { t: "Family Bike Ride round Westport Lake", v: "Westport Lake", area: "tunstall", pc: "ST6 4RZ", lat: 53.053, lng: -2.2215, d: 5, s: "10:00", e: "12:00", price: null, a: [5, 16], c: "Outdoors", org: "Stoke Cycle Hub", desc: "A gentle 5km loop with marshals. Helmets required. Free bike health check before you set off." },
  { t: "Mini Kickers Football", v: "Fenton Manor Sports Complex", area: "fenton", pc: "ST4 2RR", lat: 52.9965, lng: -2.1625, d: 3, s: "17:00", e: "18:00", price: "£5 per session", a: [3, 6], c: "Sport", org: "Potteries Mini Kickers", weekly: true, desc: "Fun first football for little ones. FA-qualified coaches, first session free." },
  { t: "Den Building in the Woods", v: "Central Forest Park", area: "hanley", pc: "ST1 5JE", lat: 53.0335, lng: -2.169, d: 4, s: "13:00", e: "15:30", price: null, a: [4, 11], c: "Outdoors", org: "City Rangers", desc: "Build dens, hunt for minibeasts and toast a marshmallow with the park rangers. Wear wellies." },
  { t: "Baby Sensory", v: "Burslem Town Hall", area: "burslem", pc: "ST6 3AJ", lat: 53.0442, lng: -2.1975, d: 2, s: "10:00", e: "11:00", price: "£7 per baby", a: [0, 1], c: "Play", org: "Baby Sensory North Staffs", weekly: true, desc: "Light shows, bubbles and songs designed for babies from birth to 13 months. Book ahead." },
  { t: "Lego Club", v: "Longton Library", area: "longton", pc: "ST3 2RQ", lat: 52.9895, lng: -2.1345, d: 3, s: "15:45", e: "16:45", price: null, a: [5, 11], c: "STEM", org: "Stoke Libraries", weekly: true, desc: "A new building challenge every week. All bricks provided." },
  { t: "Pumpkin Carving at the Minster", v: "Stoke Minster", area: "stoke", pc: "ST4 1LQ", lat: 53.0068, lng: -2.181, d: 6, s: "14:00", e: "16:00", price: "£3 per pumpkin", a: [4, 14], c: "Arts & crafts", org: "Stoke Minster Families", desc: "We supply pumpkins and tools; you supply the scary faces. Under-8s with an adult." },
  { t: "Kids' Cookery: Oatcakes!", v: "Burslem School of Art", area: "burslem", pc: "ST6 3EJ", lat: 53.0455, lng: -2.2, d: 5, s: "11:00", e: "12:30", price: "£10 per child", a: [7, 13], c: "Food", org: "Potteries Kitchen Club", desc: "Learn to make proper Staffordshire oatcakes and fill them with whatever you like." },
  { t: "Splash Session", v: "Dimensions Leisure Centre", area: "burslem", pc: "ST6 3EJ", lat: 53.0425, lng: -2.1935, d: 0, s: "15:30", e: "17:00", price: "£3.20 per child", a: [0, 16], c: "Sport", org: "Stoke Leisure", weekly: true, desc: "Inflatables out in the main pool. Under-8s must have an adult in the water." },
  { t: "Science Show: Kitchen Chemistry", v: "Hanley Library", area: "hanley", pc: "ST1 3RS", lat: 53.0258, lng: -2.176, d: 7, s: "14:00", e: "15:00", price: null, a: [6, 12], c: "STEM", org: "Keele University Outreach", desc: "Fizzing, foaming, colour-changing experiments you can try at home after. Free tickets on the door." },
  { t: "Teen Climbing Taster", v: "The Potteries Climbing Centre", area: "hanley", pc: "ST1 2QB", lat: 53.02, lng: -2.165, d: 6, s: "18:00", e: "19:30", price: "£12 per person", a: [12, 17], c: "Sport", org: "Potteries Climbing", desc: "Bouldering and roped climbing with instructors. All kit included. No experience needed." },
  { t: "Autumn Nature Trail", v: "Tunstall Park", area: "tunstall", pc: "ST6 6DA", lat: 53.0625, lng: -2.2085, d: 4, s: "10:00", e: "12:00", price: null, a: [2, 10], c: "Outdoors", org: "Friends of Tunstall Park", desc: "Pick up a leaf-spotter sheet at the bandstand and follow the trail round the lake. Stickers for finishers." },
  { t: "Rhyme Time", v: "Fenton Library", area: "fenton", pc: "ST4 3BT", lat: 53.0015, lng: -2.1545, d: 2, s: "11:00", e: "11:30", price: null, a: [0, 4], c: "Stories", org: "Stoke Libraries", weekly: true, desc: "Half an hour of songs and rhymes for babies and toddlers." },
  { t: "Junior Drama Club", v: "The Regent Theatre", area: "hanley", pc: "ST1 1AP", lat: 53.0235, lng: -2.175, d: 3, s: "16:30", e: "18:00", price: "£9 per child", a: [8, 14], c: "Performing arts", org: "Regent Youth Theatre", feat: true, weekly: true, desc: "Games, improvisation and a small showcase for parents at the end of term. Try your first session free." },
  { t: "Family Ceramics Painting", v: "Emma Bridgewater Factory", area: "hanley", pc: "ST1 3PE", lat: 53.02, lng: -2.16, d: 5, s: "12:00", e: "14:00", price: "£15 per piece", a: [4, 16], c: "Arts & crafts", org: "Emma Bridgewater", desc: "Choose a mug or plate and paint it in the decorating studio. Glazed and ready to collect in a week." },
  { t: "Queen's Park Fun Run", v: "Queen's Park", area: "longton", pc: "ST3 4HT", lat: 52.9845, lng: -2.141, d: 7, s: "10:00", e: "11:00", price: null, a: [4, 12], c: "Sport", org: "Longton Lions", desc: "1k and 2k fun runs round the park. Medals for every finisher." },
  { t: "Puppet Show: The Gruffalo's Child", v: "Spode Works", area: "stoke", pc: "ST4 1BX", lat: 53.005, lng: -2.186, d: 1, s: "13:30", e: "14:15", price: "£5 per person", a: [2, 7], c: "Performing arts", org: "Little Strings Puppets", desc: "A gentle 40-minute puppet show in the old Spode factory. Babies in arms go free." },
  { t: "Half-Term Football Camp", v: "Stoke Town Recreation Ground", area: "stoke", pc: "ST4 7AB", lat: 53.002, lng: -2.188, d: 4, s: "09:00", e: "15:00", price: "£18 per day", a: [6, 13], c: "Sport", org: "Stoke Youth Coaching", desc: "Full days of matches and skills. Bring a packed lunch and water bottle." },
  { t: "Board Game Café for Families", v: "The Leopard", area: "burslem", pc: "ST6 3AA", lat: 53.0448, lng: -2.1985, d: 6, s: "12:00", e: "16:00", price: null, a: [5, 16], c: "Play", org: "Mother Town Meeples", desc: "Hundreds of games to borrow and a volunteer to explain the rules." },
];

function at(dayKey: string, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  // Wall-clock UK time: midnight of that day plus the hours.
  return new Date(londonMidnight(dayKey).getTime() + (h * 60 + m) * 60_000);
}

export function buildSamples(now = new Date()): NewEvent[] {
  const today = londonDateKey(now);
  const out: NewEvent[] = [];
  const featuredUntil = new Date(now.getTime() + 14 * 86_400_000);
  for (const s of SAMPLES) {
    for (const offset of s.weekly ? [s.d, s.d + 7] : [s.d]) {
      const day = addDays(today, offset);
      out.push({
        slug: `${slugify(s.t)}-${day}`,
        title: s.t,
        description: s.desc,
        category: s.c,
        region: "stoke-on-trent",
        area: s.area,
        venue: s.v,
        postcode: s.pc,
        lat: s.lat,
        lng: s.lng,
        startsAt: at(day, s.s),
        endsAt: at(day, s.e),
        isFree: s.price === null,
        priceText: s.price,
        minAge: s.a[0],
        maxAge: s.a[1],
        organiser: s.org,
        bookingUrl: s.url ?? null,
        status: "approved",
        featuredUntil: s.feat ? featuredUntil : null,
        isSample: true,
      });
    }
  }
  return out;
}

async function main() {
  await db.delete(events).where(eq(events.isSample, true));
  const rows = buildSamples();
  await db.insert(events).values(rows);
  console.log(`Seeded ${rows.length} sample events.`);
}

if (process.argv[1]?.endsWith("seed.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
