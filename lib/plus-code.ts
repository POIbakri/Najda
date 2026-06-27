// Human-readable locator — the "no street addresses" answer.
// open-location-code (Plus Codes), MIT, no API key.
import { OpenLocationCode } from "open-location-code";
import { ALQUAA_CENTER } from "@/lib/config";
import { isValidCoord } from "@/lib/distance";

const olc = new OpenLocationCode();

/**
 * Full Plus Code for a coordinate, e.g. "7HVCXXXX+XX".
 * 11 digits ≈ 3m resolution — appropriate for pinpointing a person.
 * Returns "" for invalid coordinates: open-location-code does NOT throw on
 * NaN/out-of-range input — it confidently encodes garbage to a valid-looking
 * code — so we guard here rather than display a wrong-but-plausible locator.
 */
export function encodePlusCode(lat: number, lng: number): string {
  if (!isValidCoord(lat, lng)) return "";
  return olc.encode(lat, lng, 11);
}

const REGION_PREFIX = olc.encode(ALQUAA_CENTER.lat, ALQUAA_CENTER.lng, 11).slice(0, 4);

/** True when the point sits inside the Al Qua'a 100 km cell, so the short,
 *  region-relative `XXXX+XX` form (and the region label) is meaningful. */
export function isRegionalShort(lat: number, lng: number): boolean {
  const full = encodePlusCode(lat, lng);
  return full.indexOf("+") === 8 && full.slice(0, 4) === REGION_PREFIX;
}

/**
 * Short, shout-it-aloud locator — the compact `XXXX+XX` form a person can read
 * to a 998 operator or a neighbour. Within Al Qua'a every full code shares the
 * same 4-char 100 km prefix (e.g. "7HMQ"), so we drop it and keep the
 * locally-meaningful `XXXX+XX` part (recoverable with the region name). Points
 * outside the region keep the full, globally-unique code to avoid ambiguity.
 * The full code is always kept separately for navigation / SMS deep links.
 */
export function shortPlusCode(lat: number, lng: number): string {
  const full = encodePlusCode(lat, lng); // e.g. "7HMQGFJR+C22"
  const plus = full.indexOf("+");
  if (plus !== 8 || full.slice(0, 4) !== REGION_PREFIX) return full;
  // keep 4 local digits + "+" + 2 refinement digits → "GFJR+C2"
  return `${full.slice(4, 8)}+${full.slice(plus + 1, plus + 3)}`;
}

export function isValidPlusCode(code: string): boolean {
  try {
    return olc.isValid(code);
  } catch {
    return false;
  }
}
