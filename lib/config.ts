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

/** Al Qua'a approximate centre — used to seed demo responders nearby. */
export const ALQUAA_CENTER = { lat: 23.5333, lng: 55.4869 };
