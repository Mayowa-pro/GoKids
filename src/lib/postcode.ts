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

/**
 * Turns what a parent types into a map point: a full postcode ("ST4 2RR")
 * or just the first half ("ST4"). Runs in the browser too.
 */
export async function findPostcode(input: string): Promise<{ point: LatLng; label: string } | null> {
  const q = input.trim().toUpperCase().replace(/\s+/g, " ");
  if (!/^[A-Z]{1,2}\d[A-Z\d]?( ?\d[A-Z]{2})?$/.test(q)) return null;
  const full = q.replace(/\s/g, "").length > 4 ? await geocodePostcode(q) : null;
  if (full) return { point: full, label: q.includes(" ") ? q : q.replace(/(\w{3})$/, " $1") };
  try {
    const out = q.split(" ")[0];
    const res = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(out)}`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: { latitude: number; longitude: number } };
    return body.result ? { point: { lat: body.result.latitude, lng: body.result.longitude }, label: out } : null;
  } catch {
    return null;
  }
}
