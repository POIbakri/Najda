"use client";

import { db } from "@/lib/store";
import type { Alert, CreateAlertInput } from "@/lib/types";
import { uid } from "@/lib/utils";
import { allQueued, enqueueAlert, removeQueued } from "@/lib/offline-queue";

/**
 * Create an alert, or queue it if we're offline and can't reach the backend.
 * Returns the created Alert, or null when the alert was queued for later (the
 * caller shows a "will send when back online" state). Exactly one of
 * create / enqueue happens — never both — so nothing is created twice.
 */
export async function queueOrCreateAlert(input: CreateAlertInput): Promise<Alert | null> {
  const online = typeof navigator === "undefined" || navigator.onLine;
  if (online) return db.createAlert(input);

  // Offline. The demo store persists locally with no network, so it can still
  // create the alert immediately, flagged as the SMS fallback.
  if (db.mode === "demo") return db.createAlert({ ...input, delivery: "sms" });

  // Supabase offline: there is no network to hit. Queue it in IndexedDB and let
  // flushQueue() be the sole creator on reconnect (so it's never created twice).
  await enqueueAlert({ id: uid(), input: { ...input, delivery: "sms" }, queued_at: Date.now() });
  return null;
}

/** Flush any alerts queued while offline. Safe to call repeatedly. */
let flushing = false;
export async function flushQueue(): Promise<number> {
  if (flushing) return 0; // guard against concurrent flushes creating duplicates
  flushing = true;
  let sent = 0;
  try {
    const items = await allQueued();
    for (const item of items) {
      try {
        // Pass the queue id as client_id so a create-succeeded-but-delete-failed
        // window doesn't re-insert a duplicate alert on the next flush (the store
        // upserts on this id).
        await db.createAlert({ ...item.input, client_id: item.id });
        await removeQueued(item.id);
        sent++;
      } catch (e) {
        // one bad item shouldn't block the rest; it stays queued for next time
        console.error("flushQueue item failed", e);
      }
    }
  } catch (e) {
    console.error("flushQueue failed", e);
  } finally {
    flushing = false;
  }
  return sent;
}
