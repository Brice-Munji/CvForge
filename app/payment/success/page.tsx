import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { PaymentSuccessClient } from "@/components/billing/PaymentSuccessClient";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  const reference = searchParams.ref ?? "";
  if (!reference) redirect("/dashboard");

  return <PaymentSuccessClient reference={reference} />;
}
