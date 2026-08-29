import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { isSandboxMode } from "@/lib/payments/provider";
import { SandboxCheckout } from "@/components/billing/SandboxCheckout";

export const dynamic = "force-dynamic";

export default async function SandboxCheckoutPage({
  searchParams,
}: {
  searchParams: { ref?: string; amount?: string; currency?: string; plan?: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/pricing");
  // The sandbox page only exists when no real provider is configured.
  if (!isSandboxMode()) redirect("/pricing");

  const reference = searchParams.ref ?? "";
  if (!reference) redirect("/pricing");

  return (
    <SandboxCheckout
      reference={reference}
      amount={Number(searchParams.amount ?? 0)}
      currency={searchParams.currency ?? "XAF"}
      plan={searchParams.plan ?? ""}
    />
  );
}
