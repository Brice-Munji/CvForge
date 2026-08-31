import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth/server";
import { getOwnedCV } from "@/lib/server/cv-service";
import { PrintView } from "@/components/builder/PrintView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Print CV — CVForge",
  robots: { index: false },
};

export default async function PrintPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect(`/login?redirect=/builder/${params.id}/print`);

  const cv = await getOwnedCV(user.id, params.id);
  if (!cv) notFound();

  return <PrintView data={cv.data} />;
}
