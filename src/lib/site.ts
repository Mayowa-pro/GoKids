/**
 * Brand and region settings. Change the name here and it updates across the site.
 * New regions (cities) are added to REGIONS; each has its own areas for the "Near" picker.
 */
export const SITE = {
  name: "GoKids",
  tagline: "Free and paid family events near you",
  description:
    "Every local kids' event in one map and feed, free for parents. Starting in Stoke-on-Trent, coming to the rest of the Midlands.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type Area = { slug: string; name: string; lat: number; lng: number };
export type Region = {
  slug: string;
  name: string;
  live: boolean;
  center: { lat: number; lng: number };
  zoom: number;
  areas: Area[];
};

export const REGIONS: Region[] = [
  {
    slug: "stoke-on-trent",
    name: "Stoke-on-Trent",
    live: true,
    center: { lat: 53.022, lng: -2.178 },
    zoom: 12,
    areas: [
      { slug: "tunstall", name: "Tunstall", lat: 53.0595, lng: -2.212 },
      { slug: "burslem", name: "Burslem", lat: 53.045, lng: -2.199 },
      { slug: "hanley", name: "Hanley", lat: 53.0245, lng: -2.1745 },
      { slug: "stoke", name: "Stoke", lat: 53.004, lng: -2.185 },
      { slug: "fenton", name: "Fenton", lat: 52.999, lng: -2.156 },
      { slug: "longton", name: "Longton", lat: 52.988, lng: -2.133 },
      { slug: "trentham", name: "Trentham", lat: 52.966, lng: -2.199 },
      { slug: "bentilee", name: "Bentilee", lat: 53.0205, lng: -2.1265 },
      { slug: "meir", name: "Meir", lat: 52.976, lng: -2.104 },
      { slug: "abbey-hulton", name: "Abbey Hulton", lat: 53.0395, lng: -2.137 },
      { slug: "blurton", name: "Blurton", lat: 52.977, lng: -2.163 },
      { slug: "chell-heath", name: "Chell Heath", lat: 53.074, lng: -2.183 },
    ],
  },
  { slug: "newcastle-under-lyme", name: "Newcastle-under-Lyme", live: false, center: { lat: 53.011, lng: -2.227 }, zoom: 13, areas: [] },
  { slug: "stafford", name: "Stafford", live: false, center: { lat: 52.806, lng: -2.12 }, zoom: 13, areas: [] },
  { slug: "derby", name: "Derby", live: false, center: { lat: 52.921, lng: -1.476 }, zoom: 12, areas: [] },
  { slug: "nottingham", name: "Nottingham", live: false, center: { lat: 52.954, lng: -1.158 }, zoom: 12, areas: [] },
  { slug: "birmingham", name: "Birmingham", live: false, center: { lat: 52.486, lng: -1.89 }, zoom: 11, areas: [] },
];

export const LIVE_REGIONS = REGIONS.filter((r) => r.live);

export function getRegion(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export const CATEGORIES = [
  "Baby & toddler",
  "Play",
  "Stories",
  "Arts & crafts",
  "Outdoors",
  "Sport",
  "Museums",
  "STEM",
  "Performing arts",
  "Food",
] as const;
export type Category = (typeof CATEGORIES)[number];
