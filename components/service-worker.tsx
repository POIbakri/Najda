"use client";

import { useEffect } from "react";

/** Registers the PWA service worker (app-shell cache + offline). */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // avoid dev caching headaches
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline is a progressive enhancement; ignore registration failures */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
