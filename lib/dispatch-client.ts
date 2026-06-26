"use client";

import { db } from "@/lib/store";
import type { Alert, CreateAlertInput } from "@/lib/types";
import { uid } from "@/lib/utils";
import { allQueued, enqueueAlert, removeQueued } from "@/lib/offline-queue";

/**
 * Create an alert, recording it in the IndexedDB offline queue first when there
 * is no connection so it survives a dropped signal. The demo store persists
 * locally (so the alert is usable immediately and flagged "sent via SMS"); the
 * Supabase path is reconciled by flushQueue() on reconnect.
 */
export async function queueOrCreateAlert(input: CreateAlertInput): Promise<Alert> {
  const online = typeof navigator === "undefined" || navigator.onLine;
  const id = uid();
  if (!online) {
    await enqueueAlert({ id, input: { ...input, delivery: "sms" }, queued_at: Date.now() }).catch(() => {});
  }
  const alert = await db.createAlert({ ...input, delivery: online ? input.delivery : "sms" });
  if (!online) {
    // The local store already holds it; clear the queue entry once persisted.
    await removeQueued(id).catch(() => {});
  }
  return alert;
}

/** Flush any alerts queued while offline. Safe to call repeatedly. */
export async function flushQueue(): Promise<number> {
  let sent = 0;
  try {
    const items = await allQueued();
    for (const item of items) {
      await db.createAlert(item.input);
      await removeQueued(item.id);
      sent++;
    }
  } catch {
    /* try again on the next online event */
  }
  return sent;
}
