// Human-readable locator — the "no street addresses" answer.
// open-location-code (Plus Codes), MIT, no API key.
import { OpenLocationCode } from "open-location-code";

const olc = new OpenLocationCode();

/**
 * Full Plus Code for a coordinate, e.g. "7HVCXXXX+XX".
 * 11 digits ≈ 3m resolution — appropriate for pinpointing a person.
 */
export function encodePlusCode(lat: number, lng: number): string {
  return olc.encode(lat, lng, 11);
}

/**
 * Short, shout-it-aloud locator relative to a reference point (defaults to the
 * coordinate itself, which yields the 4-char-grid + "+" form people can read to
 * a 998 operator, e.g. "VCXX+XX"). We display this prominently everywhere.
 */
export function shortPlusCode(lat: number, lng: number): string {
  const full = encodePlusCode(lat, lng);
  try {
    // Shorten against the point's own area for a compact, locally-meaningful code.
    return olc.shorten(full, lat, lng);
  } catch {
    return full;
  }
}

export function isValidPlusCode(code: string): boolean {
  try {
    return olc.isValid(code);
  } catch {
    return false;
  }
}
