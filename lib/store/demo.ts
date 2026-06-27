"use client";

// Self-contained demo store: localStorage persistence, cross-tab realtime via
// BroadcastChannel + the storage event, and a clearly-labelled "demo responder"
// autopilot so a lone judge on the live URL sees the full arc:
//   SOS → nearest responder notified → "I'm coming" + ETA → approaching → resolved.
//
// A real second device on /respond takes over from the autopilot (the autopilot
// stands down the moment a human accepts), which is the true two-phone demo.

import { demoAutopilot } from "@/lib/config";
import { distanceKm, etaMinutes } from "@/lib/distance";
import { encodePlusCode } from "@/lib/plus-code";
import type {
  Alert,
  AlertResponder,
  Metrics,
  Profile,
} from "@/lib/types";
import { median, nowIso, uid } from "@/lib/utils";
import type { Store } from "./types";

const DB_KEY = "najda:db";
const ME_KEY = "najda:me";
const CHANNEL = "najda:realtime";

interface DB {
  profiles: Profile[];
  alerts: Alert[];
  alert_responders: AlertResponder[];
  seeded: boolean;
}

const empty: DB = { profiles: [], alerts: [], alert_responders: [], seeded: false };

function read(): DB {
  if (typeof window === "undefined") return { ...empty };
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...(JSON.parse(raw) as DB) };
  } catch {
    return { ...empty };
  }
}

let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!channel && "BroadcastChannel" in window) channel = new BroadcastChannel(CHANNEL);
  return channel;
}

function write(db: DB): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Quota exceeded (a long kiosk session accumulates alerts). Shed the oldest
    // finished alerts (and their ledger rows) and retry once; if it still fails,
    // give up quietly rather than throw out of an autopilot timer / user action.
    try {
      const finished = new Set(
        db.alerts
          .filter((a) => a.status === "resolved" || a.status === "cancelled")
          .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
          .slice(0, Math.ceil(db.alerts.length / 2))
          .map((a) => a.id),
      );
      db.alerts = db.alerts.filter((a) => !finished.has(a.id));
      db.alert_responders = db.alert_responders.filter((r) => !finished.has(r.alert_id));
      window.localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch {
      return; // persistence is best-effort; in-memory state is still consistent
    }
  }
  emitLocal();
  getChannel()?.postMessage("change");
}

// ── change notification ──────────────────────────────────────────────────────
const listeners = new Set<() => void>();
function emitLocal() {
  listeners.forEach((fn) => fn());
}
function onChange(fn: () => void): () => void {
  listeners.add(fn);
  const storageHandler = (e: StorageEvent) => {
    if (e.key === DB_KEY) fn();
  };
  const msgHandler = () => fn();
  if (typeof window !== "undefined") {
    window.addEventListener("storage", storageHandler);
    getChannel()?.addEventListener("message", msgHandler);
  }
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", storageHandler);
      getChannel()?.removeEventListener("message", msgHandler);
    }
  };
}

// ── identity ─────────────────────────────────────────────────────────────────
function getMeId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ME_KEY);
}
function setMeId(id: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(ME_KEY, id);
}

// ── seed responders near Al Qua'a (clearly demo) ─────────────────────────────
const DEMO_RESPONDERS: Array<Omit<Profile, "id" | "created_at">> = [
  { name: "سالم المنصوري", phone: "+971500000001", language: "ar", is_responder: true, is_available: true, home_lat: 23.541, home_lng: 55.492, skills: "إسعافات أولية" },
  { name: "فاطمة الكعبي", phone: "+971500000002", language: "ar", is_responder: true, is_available: true, home_lat: 23.527, home_lng: 55.478, skills: "ممرضة" },
  { name: "Imran Khan", phone: "+971500000003", language: "ur", is_responder: true, is_available: true, home_lat: 23.55, home_lng: 55.5, skills: "Driver, CPR" },
  { name: "خالد الشامسي", phone: "+971500000004", language: "ar", is_responder: true, is_available: false, home_lat: 23.52, home_lng: 55.46, skills: "دفاع مدني سابق" },
  { name: "Aisha Rahman", phone: "+971500000005", language: "en", is_responder: true, is_available: true, home_lat: 23.515, home_lng: 55.505, skills: "First aid" },
];

function seedInto(db: DB): DB {
  if (db.seeded) return db;
  const created = nowIso();
  db.profiles.push(
    ...DEMO_RESPONDERS.map((r, i) => ({
      ...r,
      id: `demo-${i + 1}`,
      created_at: created,
    })),
  );
  db.seeded = true;
  return db;
}

// ── autopilot (the labelled demo responder) ─────────────────────────────────
const timers = new Set<ReturnType<typeof setTimeout>>();
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => {
    timers.delete(t);
    fn();
  }, ms);
  timers.add(t);
}
function clearTimers() {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
}

function patchAlert(id: string, patch: Partial<Alert>): Alert | null {
  const db = read();
  const idx = db.alerts.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  db.alerts[idx] = { ...db.alerts[idx], ...patch };
  write(db);
  return db.alerts[idx];
}

function acceptByResponder(alertId: string, r: Profile) {
  const db = read();
  const alert = db.alerts.find((a) => a.id === alertId);
  if (!alert || alert.status !== "searching") return; // a human got there first
  const km = r.home_lat != null && r.home_lng != null ? distanceKm(alert.lat, alert.lng, r.home_lat, r.home_lng) : 3;
  const eta = etaMinutes(km);
  alert.status = "accepted";
  alert.accepted_by = r.id;
  alert.accepted_by_name = r.name;
  alert.accepted_lat = r.home_lat;
  alert.accepted_lng = r.home_lng;
  alert.accepted_at = nowIso();
  alert.eta_minutes = eta;
  const ledger = db.alert_responders.find((x) => x.alert_id === alertId && x.responder_id === r.id);
  if (ledger) {
    ledger.responded_at = nowIso();
    ledger.eta_minutes = eta;
    ledger.status = "accepted";
  }
  write(db);
}

/** Move the demo responder a fraction of the way toward the requester. */
function stepApproach(alertId: string) {
  const db = read();
  const alert = db.alerts.find((a) => a.id === alertId);
  if (!alert || alert.accepted_lat == null || alert.accepted_lng == null) return;
  if (!alert.accepted_by?.startsWith("demo-")) return;
  if (alert.status !== "en_route") return;
  const lat = alert.accepted_lat + (alert.lat - alert.accepted_lat) * 0.4;
  const lng = alert.accepted_lng + (alert.lng - alert.accepted_lng) * 0.4;
  patchAlert(alertId, { accepted_lat: lat, accepted_lng: lng });
}

function isDemoControlled(alertId: string): boolean {
  const alert = read().alerts.find((a) => a.id === alertId);
  return Boolean(alert?.accepted_by?.startsWith("demo-"));
}

function runAutopilot(alertId: string) {
  // Give a real human responder ~6s to accept before the demo responder does.
  later(() => {
    const db = read();
    const alert = db.alerts.find((a) => a.id === alertId);
    if (!alert || alert.status !== "searching") return; // human took over
    const nearest = db.profiles
      .filter((p) => p.is_responder && p.is_available && p.home_lat != null && p.home_lng != null && p.id.startsWith("demo-"))
      .sort(
        (a, b) =>
          distanceKm(alert.lat, alert.lng, a.home_lat!, a.home_lng!) -
          distanceKm(alert.lat, alert.lng, b.home_lat!, b.home_lng!),
      )[0];
    if (!nearest) return;
    acceptByResponder(alertId, nearest);

    later(() => {
      if (isDemoControlled(alertId) && read().alerts.find((a) => a.id === alertId)?.status === "accepted")
        patchAlert(alertId, { status: "en_route" });
      // approach animation
      later(() => stepApproach(alertId), 1500);
      later(() => stepApproach(alertId), 3500);
      later(() => stepApproach(alertId), 5500);
      later(() => {
        if (isDemoControlled(alertId) && read().alerts.find((a) => a.id === alertId)?.status === "en_route")
          patchAlert(alertId, { status: "on_scene", accepted_lat: read().alerts.find((a) => a.id === alertId)?.lat ?? null, accepted_lng: read().alerts.find((a) => a.id === alertId)?.lng ?? null });
      }, 7000);
      later(() => {
        const a = read().alerts.find((x) => x.id === alertId);
        if (isDemoControlled(alertId) && a && a.status === "on_scene")
          patchAlert(alertId, { status: "resolved", outcome: "helped", resolved_at: nowIso() });
      }, 11000);
    }, 3000);
  }, 6000);
}

// ── metrics ──────────────────────────────────────────────────────────────────
function computeMetrics(db: DB): Metrics {
  const deliveries: number[] = [];
  const acks: number[] = [];
  const accuracies: number[] = [];

  for (const a of db.alerts) {
    const created = Date.parse(a.created_at);
    const notifs = db.alert_responders.filter((r) => r.alert_id === a.id);
    if (notifs.length) {
      const firstNotified = Math.min(...notifs.map((r) => Date.parse(r.notified_at)));
      deliveries.push(firstNotified - created);
    }
    if (a.accepted_at) acks.push(Date.parse(a.accepted_at) - created);
    if (a.accuracy_m != null) accuracies.push(a.accuracy_m);
  }

  return {
    alertsTotal: db.alerts.length,
    alertsResolved: db.alerts.filter((a) => a.status === "resolved").length,
    notificationsSent: db.alert_responders.length,
    smsDeliveries: db.alert_responders.filter((r) => r.channel !== "app").length,
    medianDeliveryMs: median(deliveries),
    medianAckMs: median(acks),
    medianAccuracyM: median(accuracies),
    samples: db.alerts.length,
  };
}

// ── the Store implementation ─────────────────────────────────────────────────
export const demoStore: Store = {
  mode: "demo",

  meId: () => getMeId(),

  async getProfile() {
    const id = getMeId();
    if (!id) return null;
    return read().profiles.find((p) => p.id === id) ?? null;
  },

  async saveProfile(input) {
    const db = read();
    let id = getMeId();
    if (id) {
      const idx = db.profiles.findIndex((p) => p.id === id);
      if (idx !== -1) {
        db.profiles[idx] = { ...db.profiles[idx], ...input };
        write(db);
        return db.profiles[idx];
      }
    }
    id = uid();
    const profile: Profile = {
      id,
      name: input.name,
      phone: input.phone,
      language: input.language ?? "ar",
      is_responder: input.is_responder ?? false,
      is_available: input.is_available ?? false,
      home_lat: input.home_lat ?? null,
      home_lng: input.home_lng ?? null,
      skills: input.skills ?? null,
      created_at: nowIso(),
    };
    db.profiles.push(profile);
    write(db);
    setMeId(id);
    return profile;
  },

  async setAvailability(available) {
    const db = read();
    const id = getMeId();
    const p = db.profiles.find((x) => x.id === id);
    if (p) {
      p.is_available = available;
      p.is_responder = true;
      write(db);
    }
  },

  async listResponders() {
    return read().profiles.filter((p) => p.is_responder);
  },

  async createAlert(input) {
    const db = seedInto(read());
    const me = getMeId();
    const meProfile = db.profiles.find((p) => p.id === me);
    // Idempotent: a re-flushed offline alert reuses its client_id, so we update
    // the existing row instead of pushing a duplicate.
    if (input.client_id) {
      const existing = db.alerts.find((a) => a.id === input.client_id);
      if (existing) return existing;
    }
    const alert: Alert = {
      id: input.client_id ?? uid(),
      requester_id: me,
      requester_name: meProfile?.name ?? null,
      type: input.type,
      status: "searching",
      lat: input.lat,
      lng: input.lng,
      plus_code: input.plus_code ?? encodePlusCode(input.lat, input.lng),
      accuracy_m: input.accuracy_m,
      note: input.note ?? null,
      delivery: input.delivery ?? "data",
      accepted_by: null,
      accepted_by_name: null,
      accepted_lat: null,
      accepted_lng: null,
      accepted_at: null,
      eta_minutes: null,
      resolved_at: null,
      outcome: null,
      created_at: nowIso(),
    };
    db.alerts.push(alert);

    // Notify nearest available responders (the metrics ledger).
    const nearest = db.profiles
      .filter((p) => p.is_responder && p.is_available && p.home_lat != null && p.home_lng != null && p.id !== me)
      .map((p) => ({ p, km: distanceKm(alert.lat, alert.lng, p.home_lat!, p.home_lng!) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 5);

    for (const { p, km } of nearest) {
      db.alert_responders.push({
        id: uid(),
        alert_id: alert.id,
        responder_id: p.id,
        responder_name: p.name,
        distance_km: Math.round(km * 10) / 10,
        channel: alert.delivery === "sms" ? "sms" : "whatsapp",
        notified_at: nowIso(),
        responded_at: null,
        eta_minutes: null,
        status: "notified",
      });
    }
    write(db);
    // Gated identically to the Supabase path (app/status). With the flag off, a
    // pure manual / two-phone demo runs without the demo responder racing in.
    if (demoAutopilot) runAutopilot(alert.id);
    return alert;
  },

  async getAlert(id) {
    return read().alerts.find((a) => a.id === id) ?? null;
  },

  async listActiveAlerts() {
    return read()
      .alerts.filter((a) => !["resolved", "cancelled"].includes(a.status))
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  },

  async acceptAlert(alertId, eta) {
    const db = read();
    const id = getMeId();
    const me = db.profiles.find((p) => p.id === id);
    const alert = db.alerts.find((a) => a.id === alertId);
    if (!alert || !me) return;
    // Don't clobber an alert a different human already claimed. A human MAY take
    // over from the labelled demo-responder autopilot (accepted_by demo-*), which
    // then stands down (its guards require accepted_by to start with "demo-").
    const claimable =
      alert.status === "searching" ||
      alert.accepted_by == null ||
      alert.accepted_by === me.id ||
      alert.accepted_by.startsWith("demo-");
    if (!claimable) return;
    alert.status = "accepted";
    alert.accepted_by = me.id;
    alert.accepted_by_name = me.name;
    alert.accepted_lat = me.home_lat;
    alert.accepted_lng = me.home_lng;
    alert.accepted_at = nowIso();
    alert.eta_minutes = eta;
    const ledger = db.alert_responders.find((x) => x.alert_id === alertId && x.responder_id === me.id);
    if (ledger) {
      ledger.responded_at = nowIso();
      ledger.eta_minutes = eta;
      ledger.status = "accepted";
    } else {
      db.alert_responders.push({
        id: uid(),
        alert_id: alertId,
        responder_id: me.id,
        responder_name: me.name,
        distance_km: me.home_lat != null ? Math.round(distanceKm(alert.lat, alert.lng, me.home_lat, me.home_lng!) * 10) / 10 : 0,
        channel: "app",
        notified_at: alert.created_at,
        responded_at: nowIso(),
        eta_minutes: eta,
        status: "accepted",
      });
    }
    write(db);
  },

  async setStatus(alertId, status) {
    patchAlert(alertId, { status });
  },

  async resolveAlert(alertId, outcome) {
    patchAlert(alertId, { status: "resolved", outcome, resolved_at: nowIso() });
  },

  async cancelAlert(alertId) {
    patchAlert(alertId, { status: "cancelled", resolved_at: nowIso() });
  },

  async listAlertResponders(alertId) {
    return read().alert_responders.filter((r) => r.alert_id === alertId);
  },

  async getMetrics() {
    return computeMetrics(read());
  },

  subscribeAlert(id, cb) {
    const fire = () => cb(read().alerts.find((a) => a.id === id) ?? null);
    fire();
    return onChange(fire);
  },

  subscribeActiveAlerts(cb) {
    const fire = () =>
      cb(
        read()
          .alerts.filter((a) => !["resolved", "cancelled"].includes(a.status))
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
      );
    fire();
    return onChange(fire);
  },

  subscribeMetrics(cb) {
    const fire = () => cb(computeMetrics(read()));
    fire();
    return onChange(fire);
  },

  // Demo mode already runs the autopilot from createAlert; nothing to do here.
  async simulateNearestResponder() {},

  async seedDemoData() {
    write(seedInto(read()));
  },

  async resetDemoData() {
    clearTimers();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DB_KEY);
      window.localStorage.removeItem(ME_KEY);
    }
    write({ ...empty });
  },
};
