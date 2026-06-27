"use client";

import { useEffect } from "react";

/** Registers the PWA service worker (app-shell cache + offline). */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // avoid dev caching headaches
    const onLoad = () => {
      // Versioned URL so a new release re-installs the SW and rotates its caches
      // (a same-bytes /sw.js would never re-run install/activate across deploys).
      const v = process.env.NEXT_PUBLIC_BUILD_ID || "1";
      navigator.serviceWorker.register(`/sw.js?v=${v}`).catch(() => {
        /* offline is a progressive enhancement; ignore registration failures */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
