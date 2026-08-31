import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { prisma } from "@/lib/prisma";
import { isSandboxMode } from "@/lib/payments/provider";
import { processTransaction } from "@/lib/payments/activate";

export const dynamic = "force-dynamic";

/**
 * Sandbox-only: records the simulated outcome of the sandbox checkout, then
 * (for a successful outcome) triggers the same server-side processing a real
 * provider webhook would. Disabled entirely when a real provider is configured.
 */
export async function POST(req: Request) {
  if (!isSandboxMode()) return jsonError("Not available.", 404);

  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json().catch(() => ({}));
    const reference = String(body?.reference ?? "");
    const outcome = body?.outcome === "success" ? "success" : "failed";

    const payment = await prisma.payment.findUnique({
      where: { transactionId: reference },
      select: { userId: true, metadata: true },
    });
    if (!payment || payment.userId !== auth.id) {
      return jsonError("Payment not found.", 404);
    }

    await prisma.payment.update({
      where: { transactionId: reference },
      data: {
        metadata: {
          ...((payment.metadata as object) ?? {}),
          sandboxOutcome: outcome,
        },
      },
    });

    // Simulate the provider's asynchronous confirmation (idempotent).
    if (outcome === "success") await processTransaction(reference);

    return NextResponse.json({ ok: true, outcome });
  } catch (err) {
    console.error("POST /api/payments/sandbox/complete failed:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
