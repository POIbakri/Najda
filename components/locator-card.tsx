"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { AlertMap, type MapPoint } from "@/components/alert-map-dynamic";
import { shortPlusCode, isRegionalShort } from "@/lib/plus-code";
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
  const shortCode = shortPlusCode(lat, lng);
  // Only label the code with the region when it was actually shortened against
  // it (i.e. the point is in Al Qua'a). A faraway full code is globally unique
  // and naming a region it isn't in would be misleading.
  const regional = isRegionalShort(lat, lng);
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
        {/* The signature: a short, shout-aloud XXXX+XX code (resilient to narrow
            screens via break-all + fluid sizing), with its region for recovery. */}
        <p
          dir="ltr"
          className="tabular select-all break-all text-center font-bold leading-tight text-ink-900 text-[clamp(24px,8vw,30px)] tracking-[0.08em]"
          aria-label={`${t("a11y.locationCode")}: ${shortCode}${regional ? ` ${t("locator.region")}` : ""}`}
        >
          {shortCode}
          {regional && (
            <span className="ms-2 align-middle text-caption font-bold tracking-normal text-ink-600">{t("locator.region")}</span>
          )}
        </p>
        {accuracyM != null && (
          <p className="text-center text-caption text-ink-600">{t("locator.accuracy", { n: num(accuracyM) })}</p>
        )}
        {/* full, globally-unique code for a 998 operator / maps */}
        <p className="select-all text-center text-caption text-ink-600">
          <span className="font-bold">{t("locator.fullCode")}: </span>
          <bdi dir="ltr" className="tabular break-all">{plusCode}</bdi>
        </p>
        <p className="pt-1 text-center text-caption text-ink-600">{t("locator.subtitle")}</p>
      </div>

      <div className="mt-4">
        <AlertMap requester={{ lat, lng }} responder={responder} accuracyM={accuracyM} compact />
      </div>

      {children && <div className="space-y-3 p-5">{children}</div>}
    </section>
  );
}
