import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { createCV } from "@/lib/server/cv-service";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/cv-types";

export const dynamic = "force-dynamic";

/**
 * Creates a real CV record for the authenticated user, then redirects to the
 * builder for that CV. The id always comes from the database.
 */
export default async function NewBuilderPage({
  searchParams,
}: {
  searchParams: { template?: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/builder/new");

  const requested = searchParams?.template;
  const template: TemplateId = TEMPLATE_IDS.includes(requested as TemplateId)
    ? (requested as TemplateId)
    : "classic";

  const cv = await createCV(user.id, { template });
  redirect(`/builder/${cv.id}`);
}
