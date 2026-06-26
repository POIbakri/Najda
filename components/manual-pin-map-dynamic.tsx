"use client";

import dynamic from "next/dynamic";

export const ManualPinMap = dynamic(() => import("./manual-pin-map").then((m) => m.ManualPinMap), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-card bg-sand-100" aria-hidden />,
});
