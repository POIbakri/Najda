import "server-only";

// Server-only Twilio helper. Leads with WhatsApp (reaches any phone), falls back
// to SMS — the rural, patchy-data thesis. Safe no-op when unconfigured.

const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
const token = process.env.TWILIO_AUTH_TOKEN?.trim();
const from = process.env.TWILIO_FROM?.trim();

export const hasTwilio = Boolean(sid && token && from);

export interface SendResult {
  to: string;
  ok: boolean;
  sid?: string;
  error?: string;
  simulated?: boolean;
}

/** Send one message. Whether it's WhatsApp or SMS is decided by TWILIO_FROM. */
export async function sendMessage(to: string, body: string): Promise<SendResult> {
  if (!hasTwilio) return { to, ok: true, simulated: true };
  try {
    // Lazy import keeps twilio out of any client bundle.
    const twilio = (await import("twilio")).default;
    const client = twilio(sid!, token!);
    const isWhatsApp = from!.startsWith("whatsapp:");
    const dest = isWhatsApp && !to.startsWith("whatsapp:") ? `whatsapp:${to}` : to;
    const msg = await client.messages.create({ from: from!, to: dest, body });
    return { to, ok: true, sid: msg.sid };
  } catch (e) {
    return { to, ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
