"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { SOSButton } from "@/components/sos-button";
import { startWatch } from "@/lib/geo-cache";

const ONBOARDED_KEY = "najda:onboarded";

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // First launch → onboarding (skippable; SOS is never gated behind a login).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(ONBOARDED_KEY)) {
      router.replace("/onboarding");
    } else {
      setReady(true);
    }
  }, [router]);

  function handleSOS() {
    // Start acquiring the fix immediately — don't wait for type select.
    startWatch();
    router.push("/sos");
  }

  if (!ready) return null;

  return (
    <div className="flex flex-col items-center gap-8 pt-6 text-center">
      <div className="space-y-2">
        <h1 className="text-title font-bold text-ink-900">{t("app.tagline")}</h1>
        <p className="mx-auto max-w-xs text-body text-ink-600">{t("sos.subtitle")}</p>
      </div>

      <SOSButton onClick={handleSOS} />

      <p className="text-body font-bold text-ink-900">{t("sos.label")}</p>

      <div className="mx-auto flex max-w-xs items-start gap-2 rounded-card bg-sand-100 p-4 text-start">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-relief-600" aria-hidden />
        <p className="text-caption text-ink-600">{t("footer.complements")}</p>
      </div>
    </div>
  );
}
