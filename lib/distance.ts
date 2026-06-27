// Haversine distance — mirrors the earthdistance ranking used by the
// nearest_responders RPC in docs/ARCHITECTURE.md, for the demo store.

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** A finite, in-range latitude/longitude pair (the only thing we'll encode/rank). */
export function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Great-circle distance between two points, in kilometres.
 * Returns Infinity for non-finite/out-of-range input so ranking fails safe
 * (a bad point sorts last) instead of propagating NaN through comparisons.
 */
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  if (!isValidCoord(aLat, aLng) || !isValidCoord(bLat, bLng)) return Infinity;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Rough ETA in minutes assuming rural driving ~50 km/h, floored at 1.
 * Non-finite/negative input returns the floor (1) — `Math.max(1, NaN)` is NaN,
 * which would otherwise leak a literal "NaN" into the status line.
 */
export function etaMinutes(km: number, speedKmh = 50): number {
  if (!Number.isFinite(km) || km < 0) return 1;
  return Math.max(1, Math.round((km / speedKmh) * 60));
}
