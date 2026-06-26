"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so the map is client-only.
export const AlertMap = dynamic(() => import("./alert-map").then((m) => m.AlertMap), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-card bg-sand-100" aria-hidden />,
});

export type { MapPoint } from "./alert-map";
