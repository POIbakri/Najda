import type { AlertType, AlertStatus, AlertOutcome } from "@/lib/types";
import type { TKey } from "@/lib/i18n/dict";

// Icon + label + colour for each type — never colour alone (design system).
// Icons are lucide names resolved in the picker.
export const EMERGENCY_TYPES: {
  type: AlertType;
  labelKey: TKey;
  icon: "Stethoscope" | "Car" | "Flame" | "UserRound" | "CircleHelp";
}[] = [
  { type: "medical", labelKey: "type.medical", icon: "Stethoscope" },
  { type: "accident", labelKey: "type.accident", icon: "Car" },
  { type: "fire", labelKey: "type.fire", icon: "Flame" },
  { type: "person", labelKey: "type.person", icon: "UserRound" },
  { type: "other", labelKey: "type.other", icon: "CircleHelp" },
];

export const TYPE_LABEL_KEY: Record<AlertType, TKey> = {
  medical: "type.medical",
  accident: "type.accident",
  fire: "type.fire",
  person: "type.person",
  other: "type.other",
};

export const STATUS_LABEL_KEY: Record<AlertStatus, TKey> = {
  searching: "status.searching",
  accepted: "status.accepted",
  en_route: "status.en_route",
  on_scene: "status.on_scene",
  resolved: "status.resolved",
  cancelled: "status.cancelled",
};

export const OUTCOME_LABEL_KEY: Record<AlertOutcome, TKey> = {
  helped: "responder.outcomeHelped",
  handed_to_ems: "responder.outcomeEms",
  false_alarm: "responder.outcomeFalse",
};

// Progress order for the status stepper (excludes terminal cancelled).
export const STATUS_ORDER: AlertStatus[] = ["searching", "accepted", "en_route", "on_scene", "resolved"];
