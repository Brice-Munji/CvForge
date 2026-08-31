import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { listCVs } from "@/lib/server/cv-service";
import { listCoverLetters } from "@/lib/server/cover-letter-service";
import { ApplicationWizard } from "@/components/application/ApplicationWizard";

export const dynamic = "force-dynamic";

export default async function NewApplicationPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/applications/new");

  const [cvs, coverLetters] = await Promise.all([
    listCVs(user.id),
    listCoverLetters(user.id),
  ]);

  return (
    <ApplicationWizard
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      cvs={cvs.map((c) => ({
        id: c.id,
        title: c.title,
        template: c.template,
        updatedAt: c.updatedAt,
        name: c.data.personal.fullName,
        email: c.data.personal.email,
        phone: c.data.personal.phone,
      }))}
      coverLetters={coverLetters.map((c) => ({
        id: c.id,
        title: c.title,
        companyName: c.companyName,
        jobTitle: c.jobTitle,
        updatedAt: c.updatedAt,
      }))}
    />
  );
}
