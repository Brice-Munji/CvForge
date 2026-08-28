import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import {
  listApplications,
  getApplicationStats,
} from "@/lib/server/application-service";
import { ApplicationsClient } from "@/components/application/ApplicationsClient";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/applications");

  const [applications, stats] = await Promise.all([
    listApplications(user.id),
    getApplicationStats(user.id),
  ]);

  return (
    <ApplicationsClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      initial={applications}
      initialStats={stats}
    />
  );
}
