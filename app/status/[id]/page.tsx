"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, X, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { LocatorCard } from "@/components/locator-card";
import { LoadingState, ErrorState } from "@/components/states";
import { EMERGENCY_NUMBER, demoAutopilot, isSeedResponder } from "@/lib/config";
import { db } from "@/lib/store";
import { STATUS_ORDER, STATUS_LABEL_KEY } from "@/lib/emergency";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert, Profile } from "@/lib/types";

export default function StatusPage() {
  const { t, num } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [responders, setResponders] = useState<Profile[]>([]);
  const [waitedLong, setWaitedLong] = useState(false);

  useEffect(() => {
    const unsub = db.subscribeAlert(id, (a) => {
      setAlert(a);
      setLoading(false);
    });
    void db.listResponders().then(setResponders);
    return unsub;
  }, [id]);

  // Supabase mode: if no human answers within ~6s, a labelled demo responder
  // accepts so a lone judge still sees the full arc (demo store autopilots in
  // createAlert; gated by demoAutopilot — off for real deployments).
  const autopilotFired = useRef(false);
  useEffect(() => {
    if (db.mode !== "supabase" || !demoAutopilot) return;
    if (!alert || alert.status !== "searching" || alert.accepted_by || autopilotFired.current) return;
    const timer = setTimeout(async () => {
      const cur = await db.getAlert(id);
      if (cur && cur.status === "searching" && !cur.accepted_by && !autopilotFired.current) {
        autopilotFired.current = true;
        void db.simulateNearestResponder(id);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [alert?.status, alert?.accepted_by, id]);

  // After ~18s with no responder, escalate the "call 998" prompt.
  useEffect(() => {
    if (alert?.status !== "searching") {
      setWaitedLong(false);
      return;
    }
    const timer = setTimeout(() => setWaitedLong(true), 18000);
    return () => clearTimeout(timer);
  }, [alert?.status]);

  if (loading) return <LoadingState />;
  if (!alert) return <ErrorState onRetry={() => router.replace("/")} />;

  const acceptedResponder = responders.find((r) => r.id === alert.accepted_by);
  const responderPhone = acceptedResponder?.phone;
  const isDemoResponder = alert.accepted_by?.startsWith("demo-") || isSeedResponder(acceptedResponder);
  const responderPoint =
    alert.accepted_lat != null && alert.accepted_lng != null
      ? { lat: alert.accepted_lat, lng: alert.accepted_lng }
      : null;

  // ── resolved / cancelled terminal screens ──────────────────────────────────
  if (alert.status === "resolved") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="size-16 text-relief-600" aria-hidden />
        <h1 className="text-hero font-bold text-ink-900">{t("status.resolved")}</h1>
        <p className="text-body text-ink-600">{t("status.resolvedTitle")}</p>
        <Button size="block" onClick={() => router.replace("/")} className="mt-4 max-w-xs">
          {t("status.newAlert")}
        </Button>
      </div>
    );
  }
  if (alert.status === "cancelled") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <X className="size-16 text-ink-600" aria-hidden />
        <h1 className="text-title font-bold text-ink-900">{t("status.cancelled")}</h1>
        <Button size="block" onClick={() => router.replace("/")} className="mt-4 max-w-xs">
          {t("status.newAlert")}
        </Button>
      </div>
    );
  }

  const searching = alert.status === "searching";
  const eta = alert.eta_minutes ?? null;

  return (
    <div className="space-y-5 pt-2">
      {/* SMS fallback banner */}
      {alert.delivery === "sms" && (
        <div role="status" className="flex items-start gap-2 rounded-card bg-amber-500/15 p-3">
          <MessageSquare className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden />
          <div>
            <p className="text-body font-bold text-ink-900">{t("status.sentViaSms")}</p>
            <p className="text-caption text-ink-600">{t("status.sentViaSmsHint")}</p>
          </div>
        </div>
      )}

      {/* primary status headline */}
      <div className={cn("rounded-card p-5 text-center", searching ? "bg-amber-500/15" : "bg-relief-600/12")}>
        {searching ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-7 animate-spin text-amber-500" aria-hidden />
            <p className="text-title font-bold text-ink-900">{t("status.searching")}</p>
            <p className="text-caption text-ink-600">{t("status.searchingHint")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-title font-bold text-ink-900">
              {alert.status === "on_scene"
                ? t("status.on_scene", { name: alert.accepted_by_name ?? "" })
                : t("status.accepted", { name: alert.accepted_by_name ?? "" })}
            </p>
            {eta != null && alert.status !== "on_scene" && (
              <p className="text-body font-bold text-relief-600">{t("status.etaShort", { n: num(eta) })}</p>
            )}
            {isDemoResponder && (
              <span className="inline-block rounded-full bg-ink-900/5 px-2 py-0.5 text-[11px] text-ink-600">
                {t("common.demoResponder")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* widen-radius / call-998 escalation */}
      {searching && waitedLong && (
        <div role="alert" className="rounded-card bg-flare-600/10 p-4 text-center">
          <p className="text-body font-bold text-ink-900">{t("status.noResponder")}</p>
          <p className="mt-1 text-caption text-ink-600">{t("status.noResponderHint")}</p>
        </div>
      )}

      {/* stepper */}
      <StatusStepper status={alert.status} />

      {/* the signature locator card, with the responder approaching */}
      <LocatorCard
        plusCode={alert.plus_code ?? ""}
        lat={alert.lat}
        lng={alert.lng}
        accuracyM={alert.accuracy_m}
        responder={responderPoint}
      />

      {/* actions */}
      <div className="space-y-3">
        {!searching && responderPhone && (
          <a
            href={`tel:${responderPhone}`}
            className="flex min-h-touch w-full items-center justify-center gap-2 rounded-card bg-relief-600 text-body font-bold text-white shadow-soft focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2"
          >
            <Phone className="size-5" aria-hidden />
            {t("status.callResponder")}
          </a>
        )}
        <a
          href={`tel:${EMERGENCY_NUMBER}`}
          className="flex min-h-touch w-full items-center justify-center gap-2 rounded-card border-2 border-flare-600/30 bg-white text-body font-bold text-flare-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2"
        >
          <Phone className="size-5" aria-hidden />
          {t("common.callEms")}
        </a>
        <Button
          variant="ghost"
          size="block"
          onClick={() => void db.cancelAlert(alert.id)}
          className="text-ink-600"
        >
          <X className="size-5" aria-hidden />
          {t("status.cancel")}
        </Button>
      </div>
    </div>
  );
}

function StatusStepper({ status }: { status: Alert["status"] }) {
  const { t } = useI18n();
  const current = STATUS_ORDER.indexOf(status);
  return (
    <ol className="flex items-stretch gap-1.5" aria-label={t("a11y.progress")}>
      {STATUS_ORDER.map((s, i) => {
        const done = i < current;
        const isCurrent = i === current;
        // Non-colour cues: completed steps carry a check; the current step a ring.
        // Colour reinforces but never carries the meaning alone.
        return (
          <li
            key={s}
            className="flex flex-1 flex-col items-center gap-1"
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`${t(STATUS_LABEL_KEY[s])} — ${isCurrent ? t("a11y.stepCurrent") : done ? t("a11y.stepDone") : ""}`}
          >
            <span
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                done || isCurrent ? (status === "searching" ? "bg-amber-500" : "bg-relief-600") : "bg-ink-900/15",
              )}
            />
            <span aria-hidden className="flex h-4 items-center justify-center">
              {done ? (
                <Check className={cn("size-3.5", status === "searching" ? "text-amber-500" : "text-relief-600")} />
              ) : isCurrent ? (
                <span
                  className={cn(
                    "size-2.5 rounded-full ring-2",
                    status === "searching" ? "bg-amber-500 ring-amber-500/30" : "bg-relief-600 ring-relief-600/30",
                  )}
                />
              ) : (
                <span className="size-2 rounded-full bg-ink-900/15" />
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
