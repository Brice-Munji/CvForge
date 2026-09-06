import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { listCVs } from "@/lib/server/cv-service";
import { listAnalyses } from "@/lib/server/ats-service";
import { getPlanContext } from "@/lib/server/billing";
import { AtsClient } from "@/components/ats/AtsClient";

export const dynamic = "force-dynamic";

export default async function AtsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/ats");

  const [cvs, analyses, plan] = await Promise.all([
    listCVs(user.id),
    listAnalyses(user.id),
    getPlanContext(user.id),
  ]);

  return (
    <AtsClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      cvs={cvs.map((c) => ({ id: c.id, title: c.title }))}
      initialAnalyses={analyses}
      isPro={plan.isPro}
      usage={{
        used: plan.usage.atsAnalysisCount,
        limit: plan.limits.maxAtsAnalysesPerPeriod,
      }}
    />
  );
}
