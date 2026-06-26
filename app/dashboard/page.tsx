"use client";

import { useEffect, useState } from "react";
import { Activity, Users, Timer, Gauge, MessageSquare, RotateCcw } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/store";
import { TYPE_LABEL_KEY, STATUS_LABEL_KEY } from "@/lib/emergency";
import { shortPlusCode } from "@/lib/plus-code";
import type { Alert, Metrics, Profile } from "@/lib/types";

export default function DashboardPage() {
  const { t, num } = useI18n();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [responders, setResponders] = useState<Profile[]>([]);

  useEffect(() => {
    const unsubM = db.subscribeMetrics(setMetrics);
    const unsubA = db.subscribeActiveAlerts(setAlerts);
    void db.listResponders().then(setResponders);
    const t = setInterval(() => void db.listResponders().then(setResponders), 5000);
    return () => {
      unsubM();
      unsubA();
      clearInterval(t);
    };
  }, []);

  const online = responders.filter((r) => r.is_available).length;

  const secs = (ms: number | null) => (ms == null ? "—" : num((ms / 1000).toFixed(1)));

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-title font-bold text-ink-900">{t("dashboard.title")}</h1>
        <p className="text-caption text-ink-600">{t("dashboard.subtitle")}</p>
      </div>

      {/* live metric grid (also the evidence view) */}
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={<Timer className="size-5" />} label={t("dashboard.medianDelivery")} value={metrics ? secs(metrics.medianDeliveryMs) : "—"} unit={t("dashboard.seconds")} />
        <Metric icon={<Timer className="size-5" />} label={t("dashboard.medianAck")} value={metrics ? secs(metrics.medianAckMs) : "—"} unit={t("dashboard.seconds")} />
        <Metric icon={<Gauge className="size-5" />} label={t("dashboard.gpsAccuracy")} value={metrics?.medianAccuracyM != null ? num(Math.round(metrics.medianAccuracyM)) : "—"} unit={t("common.meters")} />
        <Metric icon={<MessageSquare className="size-5" />} label={t("dashboard.smsDeliveries")} value={metrics ? num(metrics.notificationsSent) : "—"} />
        <Metric icon={<Activity className="size-5" />} label={t("dashboard.activeAlerts")} value={num(alerts.length)} />
        <Metric icon={<Users className="size-5" />} label={t("dashboard.respondersOnline")} value={num(online)} />
      </div>

      <p className="text-caption text-ink-600">{t("dashboard.evidenceNote")}</p>

      {/* active alerts */}
      <div className="space-y-2">
        <h2 className="text-body font-bold text-ink-900">{t("dashboard.activeAlerts")}</h2>
        {alerts.length === 0 ? (
          <p className="text-caption text-ink-600">{t("dashboard.noData")}</p>
        ) : (
          alerts.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-3 bg-white py-3">
              <div>
                <p className="text-body font-bold text-ink-900">{t(TYPE_LABEL_KEY[a.type])}</p>
                <p dir="ltr" className="tabular text-caption text-ink-600">{shortPlusCode(a.lat, a.lng)}</p>
              </div>
              <span className="rounded-full bg-sand-100 px-3 py-1 text-caption font-bold text-ink-600">
                {t(STATUS_LABEL_KEY[a.status])}
              </span>
            </Card>
          ))
        )}
      </div>

      {/* demo controls */}
      {db.mode === "demo" && (
        <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
          <Button variant="outline" size="block" onClick={() => void db.seedDemoData()}>
            {t("dashboard.seedDemo")}
          </Button>
          <Button variant="ghost" size="block" onClick={() => void db.resetDemoData().then(() => location.reload())}>
            <RotateCcw className="size-5" aria-hidden />
            {t("dashboard.reset")}
          </Button>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit?: string }) {
  return (
    <Card className="bg-white">
      <div className="mb-1 flex items-center gap-2 text-ink-600">
        <span className="text-relief-600" aria-hidden>
          {icon}
        </span>
        <span className="text-caption font-bold">{label}</span>
      </div>
      <p className="text-hero font-bold leading-none text-ink-900">
        {value}
        {unit && <span className="text-body text-ink-600"> {unit}</span>}
      </p>
    </Card>
  );
}
