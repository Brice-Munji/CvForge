import "server-only";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getPlan, isPaidPlan, type PlanId } from "@/lib/plans";
import { getProvider } from "./provider";

export interface CheckoutResult {
  reference: string;
  checkoutUrl: string;
}

/** Create a PENDING payment and a provider checkout URL. */
export async function createCheckout(
  userId: string,
  planId: string,
  origin: string
): Promise<CheckoutResult | { error: string }> {
  if (!isPaidPlan(planId)) return { error: "Select a valid Pro plan." };
  const plan = getPlan(planId);
  const provider = getProvider();
  const reference = `cvf_${randomUUID()}`;

  await prisma.payment.create({
    data: {
      userId,
      provider: provider.name,
      transactionId: reference,
      amount: plan.price,
      currency: plan.currency,
      status: "PENDING",
      plan: planId,
      paymentType: "subscription",
      metadata: {},
    },
  });

  const checkoutUrl = await provider.createCheckoutUrl({
    reference,
    amount: plan.price,
    currency: plan.currency,
    plan: planId,
    origin,
  });

  return { reference, checkoutUrl };
}

function periodEndFor(planId: PlanId, from: Date): Date {
  const d = new Date(from);
  if (planId === "pro_yearly") d.setUTCFullYear(d.getUTCFullYear() + 1);
  else d.setUTCMonth(d.getUTCMonth() + 1); // monthly (default)
  return d;
}

export type ProcessResult =
  | { ok: true; activated: boolean; plan: string }
  | { ok: false; code: "NOT_FOUND" | "PENDING" | "FAILED" | "MISMATCH" };

/**
 * Verify a transaction with the provider and, on success, activate the
 * subscription. Fully idempotent: safe to call from both the webhook and the
 * verify endpoint, and safe to call repeatedly.
 */
export async function processTransaction(
  reference: string
): Promise<ProcessResult> {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: reference },
  });
  if (!payment) return { ok: false, code: "NOT_FOUND" };

  // Already processed — return current state without creating anything new.
  if (payment.status === "SUCCESS") {
    return { ok: true, activated: false, plan: payment.plan };
  }

  const provider = getProvider();
  const verified = await provider.verifyTransaction(reference);

  if (verified.status === "pending") return { ok: false, code: "PENDING" };
  if (verified.status === "failed") {
    await prisma.payment.updateMany({
      where: { transactionId: reference, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return { ok: false, code: "FAILED" };
  }

  // Confirm the provider's amount/currency match what we expected.
  const plan = getPlan(payment.plan);
  if (
    verified.amount !== payment.amount ||
    verified.currency !== payment.currency ||
    payment.amount !== plan.price ||
    !isPaidPlan(payment.plan)
  ) {
    await prisma.payment.updateMany({
      where: { transactionId: reference, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return { ok: false, code: "MISMATCH" };
  }

  const now = new Date();
  const periodEnd = periodEndFor(payment.plan as PlanId, now);

  const result = await prisma.$transaction(async (tx) => {
    // Re-check inside the transaction to avoid double-processing races.
    const fresh = await tx.payment.findUnique({
      where: { transactionId: reference },
      select: { status: true, userId: true },
    });
    if (!fresh) return { activated: false };
    if (fresh.status === "SUCCESS") return { activated: false };

    const subscription = await tx.subscription.upsert({
      where: { userId: payment.userId },
      update: {
        plan: payment.plan,
        status: "ACTIVE",
        provider: provider.name,
        providerSubscriptionId: reference,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId: payment.userId,
        plan: payment.plan,
        status: "ACTIVE",
        provider: provider.name,
        providerSubscriptionId: reference,
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    await tx.payment.update({
      where: { transactionId: reference },
      data: {
        status: "SUCCESS",
        providerTransactionId: verified.providerTransactionId,
        subscriptionId: subscription.id,
      },
    });

    return { activated: true };
  });

  return { ok: true, activated: result.activated, plan: payment.plan };
}
