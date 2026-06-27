// Best-effort E.164 normalization for responder phone numbers.
// Community responders won't all type a perfect "+9715…"; an unnormalized
// number is silently rejected by Twilio (error 21211), so we normalize at the
// boundary (on save) and again defensively before dispatch. UAE is the default
// country for bare local numbers.

const UAE_CC = "971";

/**
 * Returns a clean E.164 string (e.g. "+971500000001"), or null if the input
 * can't plausibly be one. Handles: spaces/dashes/parens, a leading "+", "00"
 * international prefix, a UAE local "05xxxxxxxx" / "5xxxxxxxx".
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.replace(/[\s\-().]/g, "");
  if (!s) return null;

  if (s.startsWith("+")) {
    const digits = s.slice(1).replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (s.startsWith("00")) {
    const digits = s.slice(2).replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  s = s.replace(/\D/g, "");
  if (!s) return null;
  // UAE local: 0501234567 → +971501234567 ; 501234567 → +971501234567
  if (s.startsWith("0")) s = s.slice(1);
  if (s.length === 9 && s.startsWith("5")) return `+${UAE_CC}${s}`;
  // already includes a country code (e.g. 971501234567)
  if (s.length >= 8 && s.length <= 15) return `+${s}`;
  return null;
}

/** True when the input normalizes to a plausible E.164 number. */
export function isValidPhone(raw: string | null | undefined): boolean {
  return normalizePhone(raw) !== null;
}
