"use client";

import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";

/**
 * The hero. A giant circular flare-600 button with a slow ~1.4s heartbeat pulse
 * (a beacon) — the single place we spend all the boldness. Disabled-motion safe.
 */
export function SOSButton({ onClick, className }: { onClick: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("sos.label")}
      className={cn(
        "group relative mx-auto flex aspect-square w-64 max-w-[80vw] flex-col items-center justify-center rounded-full bg-flare-600 text-white shadow-lift transition-transform animate-heartbeat",
        "hover:bg-flare-700 active:scale-95 active:bg-flare-700",
        "focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink-900",
        className,
      )}
    >
      <span className="text-hero font-bold leading-none">{t("app.name")}</span>
      <span className="mt-2 px-6 text-center text-body font-bold leading-tight opacity-95">{t("sos.hint")}</span>
    </button>
  );
}
