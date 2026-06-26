"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useI18n } from "@/components/i18n";

/** Persistent, honest "you're offline" banner — the rural connectivity reality. */
export function OfflineBanner() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-500/20 px-4 py-2 text-caption font-bold text-ink-900"
    >
      <WifiOff className="size-4" aria-hidden />
      {t("common.offline")}
    </div>
  );
}
