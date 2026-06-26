"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Navigation, CheckCircle2, ArrowRight } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { LocatorCard } from "@/components/locator-card";
import { LoadingState, ErrorState } from "@/components/states";
import { db } from "@/lib/store";
import { isSeedResponder } from "@/lib/config";
import { TYPE_LABEL_KEY, OUTCOME_LABEL_KEY } from "@/lib/emergency";
import { distanceKm } from "@/lib/distance";
import type { Alert, AlertOutcome, Profile } from "@/lib/types";

const ETA_CHOICES = [3, 5, 10, 15];

export default function ResponderAlertPage() {
  const { t, num } = useI18n();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Profile | null>(null);
  const [responders, setResponders] = useState<Profile[]>([]);
  const [picking, setPicking] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const unsub = db.subscribeAlert(id, (a) => {
      setAlert(a);
      setLoading(false);
    });
    void db.getProfile().then(setMe);
    void db.listResponders().then(setResponders);
    return unsub;
  }, [id]);

  if (loading) return <LoadingState />;
  if (!alert) return <ErrorState onRetry={() => router.replace("/respond")} />;

  const requesterPhone = responders.find((r) => r.id === alert.requester_id)?.phone ?? null;
  // You can't respond to your own alert. Otherwise it's open if unclaimed, mine,
  // or still held by the demo-responder autopilot (so a real device can take over).
  const isOwnAlert = Boolean(me?.id) && me?.id === alert.requester_id;
  const mineOrOpen =
    !isOwnAlert &&
    (!alert.accepted_by ||
      alert.accepted_by === me?.id ||
      alert.accepted_by.startsWith("demo-") ||
      isSeedResponder(responders.find((r) => r.id === alert.accepted_by)));
  const km =
    me?.home_lat != null ? Math.round(distanceKm(alert.lat, alert.lng, me.home_lat, me.home_lng!) * 10) / 10 : null;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${alert.lat},${alert.lng}`;

  async function accept(eta: number) {
    setPicking(false);
    await db.acceptAlert(id, eta);
  }
  async function resolve(outcome: AlertOutcome) {
    setResolving(false);
    await db.resolveAlert(id, outcome);
    router.replace("/respond");
  }

  if (alert.status === "resolved" || alert.status === "cancelled") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="size-14 text-relief-600" aria-hidden />
        <p className="text-title font-bold">{t(alert.status === "resolved" ? "responder.resolve" : "status.cancelled")}</p>
        <Button size="block" onClick={() => router.replace("/respond")} className="max-w-xs">
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      <button onClick={() => router.replace("/respond")} className="text-caption text-ink-600 underline">
        {t("common.back")}
      </button>

      <div className="rounded-card bg-flare-600/10 p-5 text-center">
        <p className="text-title font-bold text-ink-900">
          {t("responder.incomingTitle", { type: t(TYPE_LABEL_KEY[alert.type]), n: km != null ? num(km) : "—" })}
        </p>
        {alert.requester_name && (
          <p className="text-caption text-ink-600">
            {t("responder.requester")}: {alert.requester_name}
          </p>
        )}
        {alert.note && <p className="mt-2 text-body text-ink-900">{alert.note}</p>}
      </div>

      <LocatorCard plusCode={alert.plus_code ?? ""} lat={alert.lat} lng={alert.lng} accuracyM={alert.accuracy_m} />

      {/* taken by someone else */}
      {!mineOrOpen && (
        <div className="rounded-card bg-sand-100 p-4 text-center text-body text-ink-600">
          {t("status.accepted", { name: alert.accepted_by_name ?? "" })}
        </div>
      )}

      {/* action zone */}
      {mineOrOpen && (
        <div className="space-y-3">
          {alert.status === "searching" && !picking && (
            <Button variant="relief" size="blockLg" onClick={() => setPicking(true)}>
              {t("responder.imComing")}
            </Button>
          )}

          {alert.status === "searching" && picking && (
            <div className="space-y-2 rounded-card bg-white p-4 shadow-soft">
              <p className="text-center text-body font-bold text-ink-900">{t("responder.etaQuestion")}</p>
              <div className="grid grid-cols-4 gap-2">
                {ETA_CHOICES.map((m) => (
                  <button
                    key={m}
                    onClick={() => void accept(m)}
                    className="min-h-touch rounded-card bg-relief-600 text-body font-bold text-white focus-visible:outline focus-visible:outline-3"
                  >
                    {num(m)}
                  </button>
                ))}
              </div>
              <p className="text-center text-caption text-ink-600">{t("common.min")}</p>
            </div>
          )}

          {(alert.status === "accepted" || alert.status === "en_route" || alert.status === "on_scene") && (
            <>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-touch w-full items-center justify-center gap-2 rounded-card bg-ink-900 text-body font-bold text-sand-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2"
              >
                <Navigation className="size-5" aria-hidden />
                {t("responder.navigate")}
              </a>

              {alert.status === "accepted" && (
                <Button variant="relief" size="block" onClick={() => void db.setStatus(id, "en_route")}>
                  <ArrowRight className="size-5 rtl:rotate-180" aria-hidden />
                  {t("responder.enRoute")}
                </Button>
              )}
              {alert.status === "en_route" && (
                <Button variant="relief" size="block" onClick={() => void db.setStatus(id, "on_scene")}>
                  {t("responder.onScene")}
                </Button>
              )}
              {alert.status === "on_scene" && !resolving && (
                <Button variant="primary" size="block" onClick={() => setResolving(true)}>
                  {t("responder.resolve")}
                </Button>
              )}
              {resolving && (
                <div className="space-y-2 rounded-card bg-white p-4 shadow-soft">
                  <p className="text-center text-body font-bold text-ink-900">{t("responder.outcomeTitle")}</p>
                  {(Object.keys(OUTCOME_LABEL_KEY) as AlertOutcome[]).map((o) => (
                    <Button key={o} variant="outline" size="block" onClick={() => void resolve(o)}>
                      {t(OUTCOME_LABEL_KEY[o])}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* always-present contact affordances */}
          {requesterPhone && (
            <a
              href={`tel:${requesterPhone}`}
              className="flex min-h-touch w-full items-center justify-center gap-2 rounded-card border-2 border-ink-900/15 bg-white text-body font-bold text-ink-900 focus-visible:outline focus-visible:outline-3"
            >
              <Phone className="size-5" aria-hidden />
              {t("responder.callRequester")}
            </a>
          )}
          {/* Call 998 is always available via the persistent global bar below. */}
        </div>
      )}
    </div>
  );
}
