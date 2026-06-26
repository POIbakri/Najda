"use client";

import { Phone } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { EMERGENCY_NUMBER } from "@/lib/config";

/**
 * The mandatory, ever-present "Call 998" affordance. Najda complements formal
 * EMS; this is on every screen so a person can always reach 998 — and the
 * locator is always readable to the operator.
 */
export function CallEmergencyBar() {
  const { t } = useI18n();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/10 bg-sand-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <a
          href={`tel:${EMERGENCY_NUMBER}`}
          className="flex min-h-touch flex-1 items-center justify-center gap-2 rounded-card border-2 border-flare-600/30 bg-white text-body font-bold text-flare-700 transition-colors hover:bg-flare-600/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2"
          aria-label={t("common.callEms.aria")}
        >
          <Phone className="size-5" aria-hidden />
          {t("common.callEms")}
        </a>
      </div>
    </div>
  );
}
