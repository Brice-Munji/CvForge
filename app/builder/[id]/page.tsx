import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { getOwnedCV } from "@/lib/server/cv-service";
import { BuilderClient } from "@/components/builder/BuilderClient";

export const dynamic = "force-dynamic";

export default async function BuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect(`/login?redirect=/builder/${params.id}`);

  const cv = await getOwnedCV(user.id, params.id);
  // notFound() for both "doesn't exist" and "belongs to another user" — the
  // existence of another user's CV is never revealed.
  if (!cv) notFound();

  return (
    <BuilderClient
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      cvId={cv.id}
      initialTitle={cv.title}
      initialData={cv.data}
    />
  );
}
