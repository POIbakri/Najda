import type { AlertType, AlertStatus, AlertOutcome } from "@/lib/types";
import type { TKey } from "@/lib/i18n/dict";

// Icon + label + colour for each type — never colour alone (design system:
// "Icon + Arabic label + colour together"). flare-600 stays reserved for the SOS
// button + active-emergency surfaces, so each type gets its own restrained token.
export const EMERGENCY_TYPES: {
  type: AlertType;
  labelKey: TKey;
  icon: "Stethoscope" | "Car" | "Flame" | "UserRound" | "CircleHelp";
  color: string;
}[] = [
  { type: "medical", labelKey: "type.medical", icon: "Stethoscope", color: "text-relief-600" },
  { type: "accident", labelKey: "type.accident", icon: "Car", color: "text-amber-500" },
  { type: "fire", labelKey: "type.fire", icon: "Flame", color: "text-flare-600" },
  { type: "person", labelKey: "type.person", icon: "UserRound", color: "text-ink-900" },
  { type: "other", labelKey: "type.other", icon: "CircleHelp", color: "text-ink-600" },
];

export const TYPE_COLOR: Record<AlertType, string> = {
  medical: "text-relief-600",
  accident: "text-amber-500",
  fire: "text-flare-600",
  person: "text-ink-900",
  other: "text-ink-600",
};

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

// Short, variable-free status labels for list/badge contexts (the full
// STATUS_LABEL_KEY strings contain {name}/{n} placeholders meant for headlines).
export const STATUS_BADGE_KEY: Record<AlertStatus, TKey> = {
  searching: "status.badge.searching",
  accepted: "status.badge.accepted",
  en_route: "status.badge.en_route",
  on_scene: "status.badge.on_scene",
  resolved: "status.badge.resolved",
  cancelled: "status.badge.cancelled",
};

export const OUTCOME_LABEL_KEY: Record<AlertOutcome, TKey> = {
  helped: "responder.outcomeHelped",
  handed_to_ems: "responder.outcomeEms",
  false_alarm: "responder.outcomeFalse",
};

// Progress order for the status stepper (excludes terminal cancelled).
export const STATUS_ORDER: AlertStatus[] = ["searching", "accepted", "en_route", "on_scene", "resolved"];
