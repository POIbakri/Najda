import "server-only";
import { normalizePhone } from "@/lib/phone";

// Server-only Twilio helper. Leads with WhatsApp (reaches any phone), with an
// optional real-SMS path — the rural, patchy-data thesis. Safe no-op when unconfigured.
//   TWILIO_FROM      — primary sender (e.g. whatsapp:+1415… for the sandbox)
//   TWILIO_SMS_FROM  — optional plain-SMS sender, used when an alert asks for SMS
//                      (the no-data fallback). Falls back to TWILIO_FROM if unset.

const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
const token = process.env.TWILIO_AUTH_TOKEN?.trim();
const from = process.env.TWILIO_FROM?.trim();
const smsFrom = process.env.TWILIO_SMS_FROM?.trim();

export const hasTwilio = Boolean(sid && token && from);

export interface SendResult {
  to: string;
  ok: boolean;
  sid?: string;
  channel?: "whatsapp" | "sms";
  error?: string;
  simulated?: boolean;
}

/**
 * Send one message. `opts.channel` picks the sender: "sms" uses TWILIO_SMS_FROM
 * when configured (a genuine SMS), otherwise it falls back to TWILIO_FROM. The
 * returned `channel` reports what was ACTUALLY used, so callers/ledgers never
 * claim SMS when WhatsApp went out. The number is normalized to E.164 first, so a
 * responder who typed "050 000 0001" isn't silently rejected by Twilio (21211).
 */
export async function sendMessage(
  to: string,
  body: string,
  opts?: { channel?: "whatsapp" | "sms" },
): Promise<SendResult> {
  if (!hasTwilio) return { to, ok: true, simulated: true };

  const e164 = normalizePhone(to);
  if (!e164) {
    console.error("[najda twilio] unnormalizable number, skipping:", to);
    return { to, ok: false, error: "invalid number" };
  }
  const sender = opts?.channel === "sms" && smsFrom ? smsFrom : from!;
  const isWhatsApp = sender.startsWith("whatsapp:");
  const channel = isWhatsApp ? "whatsapp" : "sms";
  const dest = isWhatsApp ? `whatsapp:${e164}` : e164;

  try {
    // Lazy import keeps twilio out of any client bundle.
    const twilio = (await import("twilio")).default;
    const client = twilio(sid!, token!);
    const msg = await client.messages.create({ from: sender, to: dest, body });
    return { to, ok: true, sid: msg.sid, channel };
  } catch (e) {
    const error = e instanceof Error ? e.message : "send failed";
    // Surface the failure (e.g. 63015 not-opted-in, 63016 out-of-window, 21211
    // bad number) in server logs instead of swallowing it.
    console.error("[najda twilio] send failed", { to: dest, channel, error });
    return { to, ok: false, error, channel };
  }
}
