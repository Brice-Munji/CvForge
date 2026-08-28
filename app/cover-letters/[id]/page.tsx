import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { getOwnedCoverLetter } from "@/lib/server/cover-letter-service";
import { CoverLetterBuilder } from "@/components/cover-letter/CoverLetterBuilder";

export const dynamic = "force-dynamic";

export default async function CoverLetterPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect(`/login?redirect=/cover-letters/${params.id}`);

  const cl = await getOwnedCoverLetter(user.id, params.id);
  if (!cl) notFound();

  return (
    <CoverLetterBuilder
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      id={cl.id}
      initialTitle={cl.title}
      initialData={cl.data}
    />
  );
}
