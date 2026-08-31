import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Cancel at period end — the user keeps Pro until currentPeriodEnd. */
export async function POST() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: auth.id },
    });
    if (!sub || sub.status !== "ACTIVE") {
      return jsonError("You don't have an active subscription to cancel.", 400);
    }
    await prisma.subscription.update({
      where: { userId: auth.id },
      data: { cancelAtPeriodEnd: true },
    });
    return NextResponse.json({
      ok: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("POST /api/subscriptions/cancel failed:", err);
    return jsonError("We couldn't cancel your subscription. Please try again.", 500);
  }
}
