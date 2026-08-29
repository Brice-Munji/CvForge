import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { getAuthUser } from "@/lib/auth/server";
import { listCVs } from "@/lib/server/cv-service";
import { getPlanContext } from "@/lib/server/billing";
import { NewCoverLetterClient } from "@/components/cover-letter/NewCoverLetterClient";
import { ProFeatureGate } from "@/components/billing/ProFeatureGate";

export const dynamic = "force-dynamic";

export default async function NewCoverLetterPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/cover-letters/new");

  const plan = await getPlanContext(user.id);
  const headerUser = {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };

  if (!plan.isPro) {
    return (
      <ProFeatureGate
        user={headerUser}
        icon={<Mail className="h-7 w-7" strokeWidth={1.8} />}
        title="Cover Letters"
        description="Create tailored professional cover letters that reuse your CV details — a CVForge Pro feature."
        benefits={[
          "Cover letters built from your CV",
          "Classic & Modern letter templates",
          "Unlimited PDF downloads",
          "Everything else in Pro",
        ]}
      />
    );
  }

  const cvs = await listCVs(user.id);

  return (
    <NewCoverLetterClient
      user={headerUser}
      cvs={cvs.map((c) => ({
        id: c.id,
        title: c.title,
        template: c.template,
        updatedAt: c.updatedAt,
      }))}
    />
  );
}
