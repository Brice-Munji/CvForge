import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Undo a pending cancellation ("Keep Pro"). */
export async function POST() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: auth.id },
    });
    if (!sub || sub.status !== "ACTIVE") {
      return jsonError("No active subscription to update.", 400);
    }
    await prisma.subscription.update({
      where: { userId: auth.id },
      data: { cancelAtPeriodEnd: false },
    });
    return NextResponse.json({ ok: true, cancelAtPeriodEnd: false });
  } catch (err) {
    console.error("POST /api/subscriptions/resume failed:", err);
    return jsonError("We couldn't update your subscription. Please try again.", 500);
  }
}
