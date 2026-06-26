"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { AlertMap, type MapPoint } from "@/components/alert-map-dynamic";
import { cn } from "@/lib/utils";

interface LocatorCardProps {
  plusCode: string;
  lat: number;
  lng: number;
  accuracyM: number | null;
  responder?: MapPoint | null;
  children?: React.ReactNode; // primary action / extra content
  className?: string;
}

/**
 * The signature element. A large, readable, address-free location code paired
 * with a live mini-map of the nearest responder approaching. The whole product
 * in one card: no addresses here, so a code anyone can read aloud replaces them.
 */
export function LocatorCard({ plusCode, lat, lng, accuracyM, responder, children, className }: LocatorCardProps) {
  const { t, num } = useI18n();
  return (
    <section
      aria-label={t("locator.title")}
      className={cn("overflow-hidden rounded-card bg-white shadow-lift", className)}
    >
      <div className="space-y-1 px-5 pt-5">
        <div className="flex items-center gap-2 text-ink-600">
          <MapPin className="size-4 text-flare-600" aria-hidden />
          <span className="text-caption font-bold">{t("locator.title")}</span>
        </div>
        <p
          dir="ltr"
          className="tabular select-all text-center text-locator font-bold text-ink-900"
          aria-label={`location code ${plusCode}`}
        >
          {plusCode}
        </p>
        {accuracyM != null && (
          <p className="text-center text-caption text-ink-600">{t("locator.accuracy", { n: num(accuracyM) })}</p>
        )}
        <p className="pt-1 text-center text-caption text-ink-600">{t("locator.subtitle")}</p>
      </div>

      <div className="mt-4">
        <AlertMap requester={{ lat, lng }} responder={responder} accuracyM={accuracyM} compact />
      </div>

      {children && <div className="space-y-3 p-5">{children}</div>}
    </section>
  );
}
