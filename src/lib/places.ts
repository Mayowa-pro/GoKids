/**
 * Places that are good for a family outing on any day, so a quiet day is never empty.
 * Facts checked on 1 November 2026 against the council, Art Fund and venue pages linked below.
 * Keep notes short and only say what those pages say.
 */
export type Place = {
  name: string;
  region: string;
  area: string;
  postcode?: string;
  lat: number;
  lng: number;
  free: boolean;
  price?: string;
  what: string;
  when: string;
  url: string;
};

export const PLACES: Place[] = [
  {
    name: "Hanley Park",
    region: "stoke-on-trent",
    area: "hanley",
    postcode: "ST1 4DX",
    lat: 53.0157,
    lng: -2.1797,
    free: true,
    what: "Three play areas (toddler, sensory and adventure), an aerial slide and toilets.",
    when: "Open 24 hours, every day",
    url: "https://www.stoke.gov.uk/hanleypark",
  },
  {
    name: "Central Forest Park",
    region: "stoke-on-trent",
    area: "hanley",
    lat: 53.0362,
    lng: -2.1812,
    free: true,
    what: "Safari-themed adventure play area, a skate park and a trim trail.",
    when: "Open every day",
    url: "https://letsgowiththechildren.co.uk/places-to-go/central-forest-park",
  },
  {
    name: "Westport Lake",
    region: "stoke-on-trent",
    area: "burslem",
    postcode: "ST6 4RZ",
    lat: 53.0546,
    lng: -2.2186,
    free: true,
    what: "Lakeside walks with a children's play area and a car park by the visitor centre.",
    when: "Open every day",
    url: "https://staffs-wildlife.org.uk/westport-lake-visitor-centre",
  },
  {
    name: "Park Hall Country Park",
    region: "stoke-on-trent",
    area: "meir",
    postcode: "ST3 5BH",
    lat: 52.9947,
    lng: -2.0983,
    free: true,
    what: "Nature reserve with play equipment and a picnic area. No toilets.",
    when: "Open every day",
    url: "https://www.stoke.gov.uk/parkhallcountrypark",
  },
  {
    name: "Potteries Museum & Art Gallery",
    region: "stoke-on-trent",
    area: "hanley",
    postcode: "ST1 3DW",
    lat: 53.0223,
    lng: -2.1783,
    free: true,
    what: "Free museum in the city centre, with a café.",
    when: "Wed to Sat 10am to 5pm, Sun 11am to 4pm. Check before you go.",
    url: "https://www.stoke.gov.uk/directory_record/331653/potteries_museum_and_art_gallery",
  },
  {
    name: "Gladstone Pottery Museum",
    region: "stoke-on-trent",
    area: "longton",
    postcode: "ST3 1PQ",
    lat: 52.9893,
    lng: -2.1303,
    free: false,
    price: "Children £5.40, adults £7.75",
    what: "A Victorian pottery factory with bottle kilns. Family ticket £23.",
    when: "Tue to Sat, 10am to 4pm in winter. Closed for work until mid-November, so check first.",
    url: "https://localoffer.stoke.gov.uk/directory-record/2472/gladstone-pottery-museum",
  },
];

export const placesIn = (region: string) => PLACES.filter((p) => p.region === region);
