export type LatLng = { lat: number; lng: number };

/** Great-circle distance in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function kmToMiles(km: number): number {
  return km * 0.621371;
}

export function formatMiles(km: number): string {
  const mi = kmToMiles(km);
  return mi < 0.1 ? "under 0.1 mi" : `${mi.toFixed(1)} mi`;
}
