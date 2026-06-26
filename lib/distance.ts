// Haversine distance — mirrors the earthdistance ranking used by the
// nearest_responders RPC in docs/ARCHITECTURE.md, for the demo store.

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometres. */
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Rough ETA in minutes assuming rural driving ~50 km/h, floored at 1. */
export function etaMinutes(km: number, speedKmh = 50): number {
  return Math.max(1, Math.round((km / speedKmh) * 60));
}
