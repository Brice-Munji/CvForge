import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { getOwnedApplication } from "@/lib/server/application-service";
import { getOwnedCV } from "@/lib/server/cv-service";
import { ApplicationDetailClient } from "@/components/application/ApplicationDetailClient";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect(`/login?redirect=/applications/${params.id}`);

  const application = await getOwnedApplication(user.id, params.id);
  if (!application) notFound();

  // Applicant snapshot for email generation (from the attached CV, if owned).
  let applicant = { name: user.name ?? "", email: user.email, phone: "" };
  if (application.cvId) {
    const cv = await getOwnedCV(user.id, application.cvId);
    if (cv) {
      applicant = {
        name: cv.data.personal.fullName || user.name || "",
        email: cv.data.personal.email || user.email,
        phone: cv.data.personal.phone || "",
      };
    }
  }

  return (
    <ApplicationDetailClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      application={application}
      applicant={applicant}
    />
  );
}
