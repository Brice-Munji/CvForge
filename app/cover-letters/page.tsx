import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { listCoverLetters } from "@/lib/server/cover-letter-service";
import { getPlanContext } from "@/lib/server/billing";
import { CoverLettersClient } from "@/components/cover-letter/CoverLettersClient";

export const dynamic = "force-dynamic";

export default async function CoverLettersPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/cover-letters");

  const [coverLetters, plan] = await Promise.all([
    listCoverLetters(user.id),
    getPlanContext(user.id),
  ]);

  return (
    <CoverLettersClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      initial={coverLetters}
      isPro={plan.isPro}
    />
  );
}
