import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { prisma } from "@/lib/prisma";
import { processTransaction } from "@/lib/payments/activate";
import { getPlanContext } from "@/lib/server/billing";

export const dynamic = "force-dynamic";

/**
 * Server-side verification. The success page calls this — Pro is only granted
 * here (or via the webhook), never from the browser reaching /payment/success.
 */
export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json().catch(() => ({}));
    const reference = String(body?.reference ?? "");
    if (!reference) return jsonError("Missing payment reference.", 400);

    // Ownership: the payment must belong to the authenticated user.
    const payment = await prisma.payment.findUnique({
      where: { transactionId: reference },
      select: { userId: true },
    });
    if (!payment || payment.userId !== auth.id) {
      return jsonError("Payment not found.", 404);
    }

    const result = await processTransaction(reference);
    const ctx = await getPlanContext(auth.id);

    if (!result.ok) {
      const pending = result.code === "PENDING";
      return NextResponse.json(
        {
          verified: false,
          pending,
          status: pending ? "pending" : "failed",
          isPro: ctx.isPro,
        },
        { status: pending ? 202 : 200 }
      );
    }

    return NextResponse.json({
      verified: true,
      status: "success",
      isPro: ctx.isPro,
      plan: ctx.planId,
    });
  } catch (err) {
    console.error("POST /api/payments/verify failed:", err);
    return jsonError("We couldn't verify your payment. Please try again.", 500);
  }
}
