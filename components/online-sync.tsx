"use client";

import { useEffect } from "react";
import { flushQueue } from "@/lib/dispatch-client";

/** Flush the IndexedDB offline SOS queue whenever connectivity returns. */
export function OnlineSync() {
  useEffect(() => {
    const onOnline = () => void flushQueue();
    window.addEventListener("online", onOnline);
    // also try once on mount in case we loaded already-online with a backlog
    void flushQueue();
    return () => window.removeEventListener("online", onOnline);
  }, []);
  return null;
}
