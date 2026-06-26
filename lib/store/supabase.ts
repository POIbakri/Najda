"use client";

// Supabase-backed store — active only when NEXT_PUBLIC_SUPABASE_URL + anon key
// are set. Mirrors the demo store's interface using the (extended) schema in
// supabase/schema.sql. Realtime uses Postgres change subscriptions.
//
// NOTE: This path is wired but not runtime-verified in the hackathon build
// (the owner supplies the keys). The demo store is the verified deliverable.
// We are explicit about this in the README's Readiness section.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/config";
import { distanceKm } from "@/lib/distance";
import { encodePlusCode } from "@/lib/plus-code";
import type {
  Alert,
  AlertOutcome,
  AlertResponder,
  AlertStatus,
  CreateAlertInput,
  Metrics,
  Profile,
} from "@/lib/types";
import { median, nowIso } from "@/lib/utils";
import type { Store } from "./types";

const ME_KEY = "najda:me";

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) client = createClient(supabaseUrl, supabaseAnonKey, { realtime: { params: { eventsPerSecond: 5 } } });
  return client;
}

function getMeId(): string | null {
  return typeof window !== "undefined" ? window.localStorage.getItem(ME_KEY) : null;
}
function setMeId(id: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(ME_KEY, id);
}

function computeMetrics(alerts: Alert[], responders: AlertResponder[]): Metrics {
  const deliveries: number[] = [];
  const acks: number[] = [];
  const accuracies: number[] = [];
  for (const a of alerts) {
    const created = Date.parse(a.created_at);
    const notifs = responders.filter((r) => r.alert_id === a.id);
    if (notifs.length) deliveries.push(Math.min(...notifs.map((r) => Date.parse(r.notified_at))) - created);
    if (a.accepted_at) acks.push(Date.parse(a.accepted_at) - created);
    if (a.accuracy_m != null) accuracies.push(a.accuracy_m);
  }
  return {
    alertsTotal: alerts.length,
    alertsResolved: alerts.filter((a) => a.status === "resolved").length,
    notificationsSent: responders.length,
    smsDeliveries: responders.filter((r) => r.channel !== "app").length,
    medianDeliveryMs: median(deliveries),
    medianAckMs: median(acks),
    medianAccuracyM: median(accuracies),
    samples: alerts.length,
  };
}

export const supabaseStore: Store = {
  mode: "supabase",

  async getProfile() {
    const id = getMeId();
    if (!id) return null;
    const { data } = await db().from("profiles").select("*").eq("id", id).maybeSingle();
    return (data as Profile) ?? null;
  },

  async saveProfile(input) {
    const id = getMeId();
    if (id) {
      const { data } = await db().from("profiles").update(input).eq("id", id).select().single();
      return data as Profile;
    }
    const { data } = await db().from("profiles").insert({ language: "ar", ...input }).select().single();
    setMeId((data as Profile).id);
    return data as Profile;
  },

  async setAvailability(available) {
    const id = getMeId();
    if (id) await db().from("profiles").update({ is_available: available, is_responder: true }).eq("id", id);
  },

  async listResponders() {
    const { data } = await db().from("profiles").select("*").eq("is_responder", true);
    return (data as Profile[]) ?? [];
  },

  async createAlert(input: CreateAlertInput) {
    const me = getMeId();
    const plus = input.plus_code ?? encodePlusCode(input.lat, input.lng);
    const { data, error } = await db()
      .from("alerts")
      .insert({
        requester_id: me,
        type: input.type,
        lat: input.lat,
        lng: input.lng,
        plus_code: plus,
        accuracy_m: input.accuracy_m,
        note: input.note ?? null,
        delivery: input.delivery ?? "data",
        status: "searching",
      })
      .select()
      .single();
    if (error) throw error;
    const alert = data as Alert;

    // Rank nearest responders via the RPC, write the ledger, fire dispatch.
    const { data: nearest } = await db().rpc("nearest_responders", { a_lat: alert.lat, a_lng: alert.lng, max_n: 5 });
    const rows = ((nearest as Profile[]) ?? []).map((p) => ({
      alert_id: alert.id,
      responder_id: p.id,
      responder_name: p.name,
      distance_km:
        p.home_lat != null ? Math.round(distanceKm(alert.lat, alert.lng, p.home_lat, p.home_lng!) * 10) / 10 : 0,
      channel: input.delivery === "sms" ? "sms" : "whatsapp",
      status: "notified",
    }));
    if (rows.length) await db().from("alert_responders").insert(rows);
    // Twilio dispatch (server route; simulates when Twilio not configured).
    void fetch("/api/dispatch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ alertId: alert.id }),
    }).catch(() => {});
    return alert;
  },

  async getAlert(id) {
    const { data } = await db().from("alerts").select("*").eq("id", id).maybeSingle();
    return (data as Alert) ?? null;
  },

  async listActiveAlerts() {
    const { data } = await db()
      .from("alerts")
      .select("*")
      .not("status", "in", "(resolved,cancelled)")
      .order("created_at", { ascending: false });
    return (data as Alert[]) ?? [];
  },

  async acceptAlert(alertId, eta) {
    const id = getMeId();
    if (!id) return;
    const { data: me } = await db().from("profiles").select("*").eq("id", id).single();
    const p = me as Profile;
    await db()
      .from("alerts")
      .update({
        status: "accepted",
        accepted_by: p.id,
        accepted_by_name: p.name,
        accepted_lat: p.home_lat,
        accepted_lng: p.home_lng,
        accepted_at: nowIso(),
        eta_minutes: eta,
      })
      .eq("id", alertId);
    await db()
      .from("alert_responders")
      .update({ responded_at: nowIso(), eta_minutes: eta, status: "accepted" })
      .eq("alert_id", alertId)
      .eq("responder_id", p.id);
  },

  async setStatus(alertId, status: AlertStatus) {
    await db().from("alerts").update({ status }).eq("id", alertId);
  },

  async resolveAlert(alertId, outcome: AlertOutcome) {
    await db().from("alerts").update({ status: "resolved", outcome, resolved_at: nowIso() }).eq("id", alertId);
  },

  async cancelAlert(alertId) {
    await db().from("alerts").update({ status: "cancelled", resolved_at: nowIso() }).eq("id", alertId);
  },

  async listAlertResponders(alertId) {
    const { data } = await db().from("alert_responders").select("*").eq("alert_id", alertId);
    return (data as AlertResponder[]) ?? [];
  },

  async getMetrics() {
    const [{ data: alerts }, { data: responders }] = await Promise.all([
      db().from("alerts").select("*"),
      db().from("alert_responders").select("*"),
    ]);
    return computeMetrics((alerts as Alert[]) ?? [], (responders as AlertResponder[]) ?? []);
  },

  subscribeAlert(id, cb) {
    void this.getAlert(id).then(cb);
    const ch = db()
      .channel(`alert:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts", filter: `id=eq.${id}` }, () =>
        void this.getAlert(id).then(cb),
      )
      .subscribe();
    return () => void db().removeChannel(ch);
  },

  subscribeActiveAlerts(cb) {
    void this.listActiveAlerts().then(cb);
    const ch = db()
      .channel("alerts:active")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () =>
        void this.listActiveAlerts().then(cb),
      )
      .subscribe();
    return () => void db().removeChannel(ch);
  },

  subscribeMetrics(cb) {
    void this.getMetrics().then(cb);
    const ch = db()
      .channel("metrics")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => void this.getMetrics().then(cb))
      .on("postgres_changes", { event: "*", schema: "public", table: "alert_responders" }, () =>
        void this.getMetrics().then(cb),
      )
      .subscribe();
    return () => void db().removeChannel(ch);
  },

  // No-ops: real Supabase is seeded out-of-band (see supabase/seed.sql).
  async seedDemoData() {},
  async resetDemoData() {},
};
