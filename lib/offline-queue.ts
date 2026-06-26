"use client";

// Minimal IndexedDB queue for SOS alerts created while offline, so nothing is
// lost on patchy rural connectivity. On reconnect the queue is flushed.

import type { CreateAlertInput } from "@/lib/types";

const DB_NAME = "najda-offline";
const STORE = "alerts";

interface QueuedAlert {
  id: string;
  input: CreateAlertInput;
  queued_at: number;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueAlert(item: QueuedAlert): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function allQueued(): Promise<QueuedAlert[]> {
  const db = await open();
  const out = await new Promise<QueuedAlert[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueuedAlert[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return out;
}

export async function removeQueued(id: string): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function queuedCount(): Promise<number> {
  try {
    return (await allQueued()).length;
  } catch {
    return 0;
  }
}

export type { QueuedAlert };
