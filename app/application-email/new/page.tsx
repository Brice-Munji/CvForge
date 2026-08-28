import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { listCVs } from "@/lib/server/cv-service";
import { EmailGeneratorClient } from "@/components/application/EmailGeneratorClient";

export const dynamic = "force-dynamic";

export default async function NewApplicationEmailPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/application-email/new");

  const cvs = await listCVs(user.id);

  return (
    <EmailGeneratorClient
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
    />
  );
}
