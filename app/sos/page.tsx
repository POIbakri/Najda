"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Car, Flame, UserRound, CircleHelp, Loader2, Send, MapPinned } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { LocatorCard } from "@/components/locator-card";
import { ManualPinMap } from "@/components/manual-pin-map-dynamic";
import { EMERGENCY_TYPES } from "@/lib/emergency";
import { shortPlusCode } from "@/lib/plus-code";
import { subscribeGeo, stopWatch, setManualFix, startWatch } from "@/lib/geo-cache";
import { queueOrCreateAlert } from "@/lib/dispatch-client";
import type { AlertType } from "@/lib/types";
import type { FixResult } from "@/lib/geolocation";

const ICONS = { Stethoscope, Car, Flame, UserRound, CircleHelp } as const;

export default function SosPage() {
  const { t, num } = useI18n();
  const router = useRouter();

  const [type, setType] = useState<AlertType | null>(null);
  const [geo, setGeo] = useState<{ fix: FixResult | null; error: unknown; watching: boolean }>({
    fix: null,
    error: null,
    watching: false,
  });
  const [manual, setManual] = useState<{ lat: number; lng: number } | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  // Keep the warm fix flowing; ensure a watch is running even on direct nav.
  useEffect(() => {
    startWatch();
    const unsub = subscribeGeo((s) => setGeo(s));
    return unsub;
  }, []);

  const fix = geo.fix;
  const hasGeoError = Boolean(geo.error) && !fix;

  // Effective location: live fix wins; otherwise the manual pin.
  const loc = fix ?? (manual ? { lat: manual.lat, lng: manual.lng, accuracy_m: null as number | null } : null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const code = useMemo(() => (loc ? shortPlusCode(loc.lat, loc.lng) : ""), [loc?.lat, loc?.lng]);

  async function send() {
    if (!type || !loc) return;
    setSending(true);
    try {
      const online = typeof navigator === "undefined" || navigator.onLine;
      const alert = await queueOrCreateAlert({
        type,
        lat: loc.lat,
        lng: loc.lng,
        plus_code: code,
        accuracy_m: loc.accuracy_m ?? null,
        note: note.trim() || null,
        delivery: online ? "data" : "sms",
      });
      stopWatch();
      router.push(`/status/${alert.id}`);
    } catch {
      setSending(false);
    }
  }

  // ── Step 1: choose type ────────────────────────────────────────────────────
  if (!type) {
    return (
      <div className="space-y-5 pt-2">
        <h1 className="text-center text-title font-bold">{t("type.title")}</h1>
        {/* location is already acquiring in the background */}
        <p className="flex items-center justify-center gap-2 text-caption text-ink-600">
          {geo.watching && !fix ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> {t("locator.acquiring")}
            </>
          ) : fix ? (
            <>
              <MapPinned className="size-4 text-relief-600" aria-hidden /> {t("locator.accuracy", { n: num(fix.accuracy_m) })}
            </>
          ) : null}
        </p>
        <div className="grid grid-cols-1 gap-3">
          {EMERGENCY_TYPES.map(({ type: ty, labelKey, icon }) => {
            const Icon = ICONS[icon];
            return (
              <button
                key={ty}
                type="button"
                onClick={() => setType(ty)}
                className="flex min-h-touch items-center gap-4 rounded-card bg-sand-100 px-5 py-4 text-start text-body font-bold text-ink-900 shadow-soft transition-transform active:scale-[0.99] hover:bg-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2"
              >
                <Icon className="size-7 text-flare-600" aria-hidden />
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Step 2: locator + send ─────────────────────────────────────────────────
  return (
    <div className="space-y-5 pt-2">
      <button onClick={() => setType(null)} className="text-caption text-ink-600 underline">
        {t("common.back")}
      </button>

      {/* manual-pin fallback when GPS failed or the user opts in */}
      {(hasGeoError || showManual) && !fix ? (
        <div className="space-y-3">
          <div className="rounded-card bg-amber-500/15 p-4">
            <p className="text-body font-bold text-ink-900">{t("locator.failedTitle")}</p>
            <p className="text-caption text-ink-600">{t("locator.failedBody")}</p>
          </div>
          <ManualPinMap initial={manual} onChange={(p) => setManual(p)} />
          {manual && (
            <p dir="ltr" className="tabular text-center text-locator font-bold text-ink-900">
              {shortPlusCode(manual.lat, manual.lng)}
            </p>
          )}
        </div>
      ) : loc ? (
        <LocatorCard plusCode={code} lat={loc.lat} lng={loc.lng} accuracyM={loc.accuracy_m} />
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-ink-600">
          <Loader2 className="size-8 animate-spin" aria-hidden />
          <p className="text-body">{t("locator.acquiring")}</p>
          <p className="text-caption">{t("locator.acquiringHint")}</p>
          <button onClick={() => setShowManual(true)} className="mt-2 text-caption text-ink-900 underline">
            {t("locator.manualPin")}
          </button>
        </div>
      )}

      {/* optional note */}
      {loc && (
        <label className="block space-y-1">
          <span className="text-caption font-bold text-ink-600">{t("locator.noteLabel")}</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("locator.notePlaceholder")}
            className="min-h-touch w-full rounded-card border-2 border-ink-900/15 bg-white px-4 text-body focus-visible:border-ink-900 focus-visible:outline-none"
          />
        </label>
      )}

      {!fix && !showManual && !hasGeoError && (
        <button onClick={() => setShowManual(true)} className="block w-full text-center text-caption text-ink-900 underline">
          {t("locator.manualPin")}
        </button>
      )}

      <Button variant="flare" size="blockLg" onClick={send} disabled={!loc || sending}>
        {sending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Send className="size-5" aria-hidden />}
        {t("locator.send")}
      </Button>
    </div>
  );
}
