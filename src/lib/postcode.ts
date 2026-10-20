import type { LatLng } from "./geo";

/** Look up a UK postcode with the free postcodes.io API. Returns null if it can't be found. */
export async function geocodePostcode(postcode: string): Promise<LatLng | null> {
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: { latitude: number; longitude: number } };
    return body.result ? { lat: body.result.latitude, lng: body.result.longitude } : null;
  } catch {
    return null;
  }
}
