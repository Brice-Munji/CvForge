import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { listCVs } from "@/lib/server/cv-service";
import { DashboardClient } from "@/components/app/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const cvs = await listCVs(user.id);

  return (
    <DashboardClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      initialCVs={cvs}
    />
  );
}
