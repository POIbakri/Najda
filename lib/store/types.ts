import type {
  Alert,
  AlertOutcome,
  AlertResponder,
  AlertStatus,
  CreateAlertInput,
  Metrics,
  Profile,
} from "@/lib/types";

// A single interface that both the demo store and the Supabase store implement,
// so every screen is backend-agnostic. Subscriptions return an unsubscribe fn.
export interface Store {
  readonly mode: "demo" | "supabase";

  /** Stable local identity (localStorage), available before a Profile row loads.
   *  Used for self-checks (don't show/answer your own alert) that must hold even
   *  when onboarding was skipped. Null when this device has no identity yet. */
  meId(): string | null;

  // profiles
  getProfile(): Promise<Profile | null>;
  saveProfile(input: Partial<Profile> & { name: string; phone: string }): Promise<Profile>;
  setAvailability(available: boolean): Promise<void>;
  listResponders(): Promise<Profile[]>;

  // alerts
  createAlert(input: CreateAlertInput): Promise<Alert>;
  getAlert(id: string): Promise<Alert | null>;
  listActiveAlerts(): Promise<Alert[]>;
  acceptAlert(alertId: string, etaMinutes: number): Promise<void>;
  setStatus(alertId: string, status: AlertStatus): Promise<void>;
  resolveAlert(alertId: string, outcome: AlertOutcome): Promise<void>;
  cancelAlert(alertId: string): Promise<void>;

  // metrics ledger
  listAlertResponders(alertId: string): Promise<AlertResponder[]>;
  getMetrics(): Promise<Metrics>;

  // realtime
  subscribeAlert(id: string, cb: (a: Alert | null) => void): () => void;
  subscribeActiveAlerts(cb: (a: Alert[]) => void): () => void;
  subscribeMetrics(cb: (m: Metrics) => void): () => void;

  // demo affordances
  seedDemoData(): Promise<void>;
  resetDemoData(): Promise<void>;
  /**
   * Have a labelled seeded "demo responder" accept and approach, so a lone judge
   * sees the full arc. No-op in demo mode (its createAlert already autopilots).
   * Gated by the caller on `demoAutopilot`. A real responder can still take over.
   */
  simulateNearestResponder(alertId: string): Promise<void>;
}
