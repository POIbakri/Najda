// Feature detection. Najda runs fully without any backend (demo mode); it
// upgrades to real services when env vars are present. Keep these checks in one
// place so every module agrees on which mode we're in.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

/** True when real Supabase (Postgres + Realtime) is configured. */
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

/** Public base URL for SMS deep links; falls back to request origin at runtime. */
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "";

/** The emergency number Najda complements — never replaces. */
export const EMERGENCY_NUMBER = "998";

/**
 * Demo-responder autopilot. When on, an alert that no human answers within a few
 * seconds is accepted by a clearly-labelled seeded "demo responder" that then
 * approaches and resolves — so a lone judge on the live URL sees the full arc.
 * A real second device can still take over. MUST be off for real deployments.
 * Defaults on; set NEXT_PUBLIC_DEMO_AUTOPILOT=off to disable.
 */
export const demoAutopilot =
  (process.env.NEXT_PUBLIC_DEMO_AUTOPILOT?.trim().toLowerCase() ?? "on") !== "off";

/** Seeded demo responders share this phone prefix — used to label/identify them. */
export const SEED_PHONE_PREFIX = "+97150000000";

/** True for a seeded demo responder (works in both demo and Supabase modes). */
export function isSeedResponder(p: { id?: string | null; phone?: string | null } | null | undefined): boolean {
  if (!p) return false;
  return Boolean(p.id?.startsWith("demo-")) || Boolean(p.phone?.startsWith(SEED_PHONE_PREFIX));
}

/** Al Qua'a approximate centre — used to seed demo responders nearby. */
export const ALQUAA_CENTER = { lat: 23.5333, lng: 55.4869 };
