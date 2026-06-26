"use client";

// A module-level cache so the high-accuracy fix begins the instant SOS is
// tapped on Home and is still warming when /sos mounts — it survives client
// navigation. The fix keeps refining (watch) while the user picks a type.

import { GeoError, watchFix, type FixResult } from "@/lib/geolocation";

interface GeoState {
  fix: FixResult | null;
  error: GeoError | null;
  watching: boolean;
}

let state: GeoState = { fix: null, error: null, watching: false };
let stop: (() => void) | null = null;
const listeners = new Set<(s: GeoState) => void>();

function emit() {
  const snapshot = { ...state };
  listeners.forEach((fn) => fn(snapshot));
}

export function startWatch() {
  if (state.watching) return;
  state = { ...state, watching: true, error: null };
  emit();
  stop = watchFix(
    (fix) => {
      // Keep the best (most accurate) fix we've seen.
      if (!state.fix || fix.accuracy_m <= state.fix.accuracy_m) {
        state = { ...state, fix, error: null };
        emit();
      }
    },
    (error) => {
      state = { ...state, error };
      emit();
    },
  );
}

export function stopWatch() {
  stop?.();
  stop = null;
  state = { ...state, watching: false };
  emit();
}

export function resetGeo() {
  stopWatch();
  state = { fix: null, error: null, watching: false };
  emit();
}

/** Manually set a fix (used by the manual map-pin fallback). */
export function setManualFix(fix: FixResult) {
  state = { ...state, fix, error: null };
  emit();
}

export function getGeoState(): GeoState {
  return { ...state };
}

export function subscribeGeo(cb: (s: GeoState) => void): () => void {
  listeners.add(cb);
  cb({ ...state });
  return () => listeners.delete(cb);
}
