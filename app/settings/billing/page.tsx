import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { getPlanContext } from "@/lib/server/billing";
import { prisma } from "@/lib/prisma";
import { BillingClient } from "@/components/billing/BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/settings/billing");

  const [plan, paymentRows] = await Promise.all([
    getPlanContext(user.id),
    prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const payments = paymentRows.map((p) => ({
    id: p.id,
    createdAt: p.createdAt.toISOString(),
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    plan: p.plan,
  }));

  return (
    <BillingClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      plan={plan}
      payments={payments}
    />
  );
}
