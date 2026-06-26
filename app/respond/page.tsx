"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stethoscope, Car, Flame, UserRound, CircleHelp, ChevronLeft } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/states";
import { db } from "@/lib/store";
import { TYPE_LABEL_KEY } from "@/lib/emergency";
import { distanceKm } from "@/lib/distance";
import { shortPlusCode } from "@/lib/plus-code";
import { getFix } from "@/lib/geolocation";
import { cn } from "@/lib/utils";
import type { Alert, AlertType, Profile } from "@/lib/types";

const ICONS: Record<AlertType, typeof Stethoscope> = {
  medical: Stethoscope,
  accident: Car,
  fire: Flame,
  person: UserRound,
  other: CircleHelp,
};

export default function RespondPage() {
  const { t, num } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [busy, setBusy] = useState(false);

  // quick inline registration (name/phone) for first-time responders
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    void db.getProfile().then((p) => {
      setProfile(p);
      setName(p?.name ?? "");
      setPhone(p?.phone ?? "");
      setLoadingProfile(false);
    });
    const unsub = db.subscribeActiveAlerts(setAlerts);
    return unsub;
  }, []);

  async function becomeAvailable(available: boolean) {
    setBusy(true);
    try {
      // capture home location for nearest-responder ranking (best effort)
      let home: { lat: number; lng: number } | null = null;
      if (available) {
        try {
          const fix = await getFix(8000);
          home = { lat: fix.lat, lng: fix.lng };
        } catch {
          /* ranking falls back to no-home; still available */
        }
      }
      const saved = await db.saveProfile({
        name: name.trim() || profile?.name || t("common.responder"),
        phone: phone.trim() || profile?.phone || "",
        is_responder: true,
        is_available: available,
        ...(home ? { home_lat: home.lat, home_lng: home.lng } : {}),
      });
      await db.setAvailability(available);
      setProfile({ ...saved, is_available: available });
    } finally {
      setBusy(false);
    }
  }

  if (loadingProfile) return <LoadingState />;

  const available = profile?.is_available ?? false;
  const home = profile?.home_lat != null ? { lat: profile.home_lat, lng: profile.home_lng! } : null;

  const sorted = [...alerts].sort((a, b) => {
    if (!home) return Date.parse(b.created_at) - Date.parse(a.created_at);
    return distanceKm(a.lat, a.lng, home.lat, home.lng) - distanceKm(b.lat, b.lng, home.lat, home.lng);
  });

  return (
    <div className="space-y-5 pt-2">
      {/* availability */}
      <Card className="bg-white">
        {!profile && (
          <div className="mb-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("onboarding.namePlaceholder")}
              className="min-h-touch w-full rounded-card border-2 border-ink-900/15 bg-sand-50 px-4 text-body focus-visible:border-ink-900 focus-visible:outline-none"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("onboarding.phonePlaceholder")}
              dir="ltr"
              inputMode="tel"
              className="min-h-touch w-full rounded-card border-2 border-ink-900/15 bg-sand-50 px-4 text-body focus-visible:border-ink-900 focus-visible:outline-none"
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-body font-bold text-ink-900">{t("responder.availTitle")}</p>
            <p className="text-caption text-ink-600">{available ? t("responder.availOn") : t("responder.availOff")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={available}
            aria-label={t("responder.availTitle")}
            disabled={busy}
            onClick={() => void becomeAvailable(!available)}
            // 56px tap-target floor; the 36px visual track lives inside the padded hit area
            className="flex min-h-touch shrink-0 items-center justify-center px-2"
          >
            <span
              className={cn(
                "relative block h-9 w-16 rounded-full transition-colors",
                available ? "bg-relief-600" : "bg-ink-900/20",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 size-7 rounded-full bg-white shadow transition-all",
                  available ? "start-8" : "start-1",
                )}
              />
            </span>
          </button>
        </div>
      </Card>

      {/* nearby requests */}
      <div className="space-y-3">
        <h2 className="text-title font-bold text-ink-900">{t("responder.listTitle")}</h2>
        {sorted.length === 0 ? (
          <EmptyState title={t("responder.emptyTitle")} body={t("responder.emptyBody")} />
        ) : (
          sorted.map((a) => {
            const Icon = ICONS[a.type];
            const km = home ? Math.round(distanceKm(a.lat, a.lng, home.lat, home.lng) * 10) / 10 : null;
            return (
              <Link key={a.id} href={`/respond/${a.id}`} className="block">
                <Card className="flex items-center gap-4 bg-white transition-transform active:scale-[0.99]">
                  <Icon className="size-7 shrink-0 text-flare-600" aria-hidden />
                  <div className="flex-1">
                    <p className="text-body font-bold text-ink-900">
                      {t(TYPE_LABEL_KEY[a.type])}
                      {km != null && <span className="text-ink-600"> · {t("responder.distanceAway", { n: num(km) })}</span>}
                    </p>
                    <p dir="ltr" className="tabular text-caption text-ink-600">
                      {shortPlusCode(a.lat, a.lng)}
                    </p>
                  </div>
                  <ChevronLeft className="size-5 text-ink-600 rtl:rotate-180" aria-hidden />
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
