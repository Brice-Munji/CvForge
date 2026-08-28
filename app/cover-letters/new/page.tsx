import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { listCVs } from "@/lib/server/cv-service";
import { NewCoverLetterClient } from "@/components/cover-letter/NewCoverLetterClient";

export const dynamic = "force-dynamic";

export default async function NewCoverLetterPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/cover-letters/new");

  const cvs = await listCVs(user.id);

  return (
    <NewCoverLetterClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      cvs={cvs.map((c) => ({
        id: c.id,
        title: c.title,
        template: c.template,
        updatedAt: c.updatedAt,
      }))}
    />
  );
}
