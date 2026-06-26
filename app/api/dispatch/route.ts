import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasSupabase, supabaseAnonKey, supabaseUrl, baseUrl, EMERGENCY_NUMBER } from "@/lib/config";
import { hasTwilio, sendMessage } from "@/lib/twilio";
import type { Alert, AlertResponder, Profile } from "@/lib/types";

export const runtime = "nodejs";

// Triggered by the Supabase store on alert insert. Reads the nearest responders
// and sends each a WhatsApp/SMS with the locator + a deep link. In demo mode the
// client simulates this locally; this route is the production path.
export async function POST(req: Request) {
  let alertId: string | undefined;
  try {
    ({ alertId } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (!alertId) return NextResponse.json({ ok: false, error: "alertId required" }, { status: 400 });

  // Without Supabase there is no server-side alert to read — nothing to do.
  if (!hasSupabase) {
    return NextResponse.json({ ok: true, simulated: true, reason: "no-supabase" });
  }

  try {
    return await dispatch(req, alertId);
  } catch (e) {
    console.error("dispatch failed", e);
    return NextResponse.json({ ok: false, error: "dispatch failed" }, { status: 500 });
  }
}

async function dispatch(req: Request, alertId: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: alert, error: alertErr } = await supabase.from("alerts").select("*").eq("id", alertId).maybeSingle<Alert>();
  if (alertErr) throw alertErr;
  if (!alert) return NextResponse.json({ ok: false, error: "alert not found" }, { status: 404 });

  // Abuse guard: only dispatch for a fresh, still-searching alert. This limits an
  // unauthenticated caller to (at most) re-notifying the already-selected
  // responders of a genuine, recent alert. Production should additionally require
  // a service-role context (see README "Security & production hardening").
  const ageMs = Date.now() - Date.parse(alert.created_at);
  if (alert.status !== "searching" || ageMs > 10 * 60 * 1000) {
    return NextResponse.json({ ok: true, skipped: true, reason: "not a fresh searching alert" });
  }

  const { data: ledger } = await supabase.from("alert_responders").select("*").eq("alert_id", alertId);
  const responders = (ledger as AlertResponder[]) ?? [];
  const ids = responders.map((r) => r.responder_id);

  const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
  const phones = new Map((profiles as Profile[] | null)?.map((p) => [p.id, p.phone]) ?? []);

  const origin = baseUrl || new URL(req.url).origin;
  const link = `${origin}/respond/${alertId}`;

  const results = await Promise.all(
    responders.map((r) => {
      const phone = phones.get(r.responder_id);
      if (!phone) return Promise.resolve({ to: r.responder_id, ok: false, error: "no phone" });
      // Arabic-first message; the locator is the load-bearing line.
      const body =
        `🚨 نجدة: حالة (${alert.type}) على بُعد ~${r.distance_km} كم.\n` +
        `رمز الموقع: ${alert.plus_code ?? `${alert.lat},${alert.lng}`}\n` +
        `استجب: ${link}\n` +
        `الطوارئ: ${EMERGENCY_NUMBER}`;
      return sendMessage(phone, body);
    }),
  );

  return NextResponse.json({
    ok: true,
    simulated: !hasTwilio,
    sent: results.filter((r) => r.ok).length,
    results,
  });
}
