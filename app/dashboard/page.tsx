import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { listCVs } from "@/lib/server/cv-service";
import {
  listApplications,
  getApplicationStats,
} from "@/lib/server/application-service";
import { getPlanContext } from "@/lib/server/billing";
import { DashboardClient } from "@/components/app/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const [cvs, applications, stats, plan] = await Promise.all([
    listCVs(user.id),
    listApplications(user.id),
    getApplicationStats(user.id),
    getPlanContext(user.id),
  ]);

  return (
    <DashboardClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      initialCVs={cvs}
      stats={stats}
      recentApplications={applications.slice(0, 4)}
      plan={{
        isPro: plan.isPro,
        planId: plan.planId,
        usage: plan.usage,
        limits: plan.limits,
      }}
      isAdmin={user.role === "ADMIN"}
    />
  );
}
