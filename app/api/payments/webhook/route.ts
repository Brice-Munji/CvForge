import { NextResponse } from "next/server";
import { getProvider, isSandboxMode } from "@/lib/payments/provider";
import { processTransaction } from "@/lib/payments/activate";

export const dynamic = "force-dynamic";

/**
 * Payment provider webhook. Idempotent — repeated deliveries never create
 * duplicate subscriptions (processTransaction is safe to call repeatedly).
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // In sandbox mode, require a shared secret header (mirrors a provider's
    // signature check). Real providers verify a signature in parseWebhook.
    if (isSandboxMode()) {
      const expected = process.env.PAYMENT_WEBHOOK_SECRET || "sandbox-webhook-secret";
      const provided = req.headers.get("x-webhook-secret");
      if (provided !== expected) {
        return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
      }
    }

    const provider = getProvider();
    const event = await provider.parseWebhook(req, rawBody);
    if (!event.signatureValid) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
    if (!event.reference) {
      // Nothing to do, but acknowledge so the provider stops retrying.
      return NextResponse.json({ received: true });
    }

    await processTransaction(event.reference);
    // Always 200 on a well-formed event so the provider doesn't retry forever.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("POST /api/payments/webhook failed:", err);
    return NextResponse.json({ error: "Webhook error." }, { status: 500 });
  }
}
