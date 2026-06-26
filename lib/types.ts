// Domain types — mirror the Supabase schema in docs/ARCHITECTURE.md.
// The demo store and the Supabase store both speak these types.

export type AlertType = "medical" | "accident" | "fire" | "person" | "other";

export type AlertStatus =
  | "searching"
  | "accepted"
  | "en_route"
  | "on_scene"
  | "resolved"
  | "cancelled";

export type AlertOutcome = "helped" | "handed_to_ems" | "false_alarm";

export type Language = "ar" | "en" | "ur";

export interface Profile {
  id: string;
  name: string;
  phone: string;
  language: Language;
  is_responder: boolean;
  is_available: boolean;
  home_lat: number | null;
  home_lng: number | null;
  skills: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  requester_id: string | null;
  requester_name: string | null;
  type: AlertType;
  status: AlertStatus;
  lat: number;
  lng: number;
  plus_code: string | null;
  accuracy_m: number | null;
  note: string | null;
  delivery: "data" | "sms"; // how the alert reached responders (SMS = no-data fallback)
  accepted_by: string | null;
  accepted_by_name: string | null;
  accepted_lat: number | null;
  accepted_lng: number | null;
  accepted_at: string | null;
  eta_minutes: number | null;
  resolved_at: string | null;
  outcome: AlertOutcome | null;
  created_at: string;
}

// The metrics ledger — one row per responder notified for an alert.
// notified_at / responded_at / eta_minutes produce the drill numbers.
export interface AlertResponder {
  id: string;
  alert_id: string;
  responder_id: string;
  responder_name: string;
  distance_km: number;
  channel: "app" | "sms" | "whatsapp";
  notified_at: string;
  responded_at: string | null;
  eta_minutes: number | null;
  status: "notified" | "accepted" | "declined";
}

export interface CreateAlertInput {
  type: AlertType;
  lat: number;
  lng: number;
  plus_code: string | null;
  accuracy_m: number | null;
  note?: string | null;
  delivery?: "data" | "sms";
}

// Aggregated metrics for the coordinator dashboard / evidence view.
export interface Metrics {
  alertsTotal: number;
  alertsResolved: number;
  notificationsSent: number;
  smsDeliveries: number;
  medianDeliveryMs: number | null; // SOS create → first responder notified
  medianAckMs: number | null; // alert created → first acknowledgment
  medianAccuracyM: number | null; // GPS accuracy across alerts
  samples: number;
}
