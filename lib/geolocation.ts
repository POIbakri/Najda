// High-accuracy geolocation with a graceful fallback contract.
// We start acquiring the instant SOS is tapped (don't wait for type select).

export interface FixResult {
  lat: number;
  lng: number;
  accuracy_m: number;
}

export type GeoErrorKind = "denied" | "unavailable" | "timeout" | "unsupported";

export class GeoError extends Error {
  kind: GeoErrorKind;
  constructor(kind: GeoErrorKind, message?: string) {
    super(message ?? kind);
    this.kind = kind;
    this.name = "GeoError";
  }
}

/** One high-accuracy fix. Rejects with a typed GeoError so the UI can branch. */
export function getFix(timeoutMs = 12000): Promise<FixResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new GeoError("unsupported", "Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy_m: Math.round(pos.coords.accuracy),
        }),
      (err) => {
        const kind: GeoErrorKind =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
              ? "timeout"
              : "unavailable";
        reject(new GeoError(kind, err.message));
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}

/**
 * Watch position, calling back as accuracy improves. Returns a stop function.
 * Used to keep refining the fix while the user picks an emergency type.
 */
export function watchFix(
  onFix: (fix: FixResult) => void,
  onError?: (err: GeoError) => void,
): () => void {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError?.(new GeoError("unsupported"));
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) =>
      onFix({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy_m: Math.round(pos.coords.accuracy),
      }),
    (err) => {
      const kind: GeoErrorKind =
        err.code === err.PERMISSION_DENIED
          ? "denied"
          : err.code === err.TIMEOUT
            ? "timeout"
            : "unavailable";
      onError?.(new GeoError(kind, err.message));
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
  return () => navigator.geolocation.clearWatch(id);
}
