import { BuilderClient } from "@/components/builder/BuilderClient";
import type { TemplateId } from "@/lib/cv-types";

const VALID: TemplateId[] = ["classic", "modern", "minimal"];

export default function NewBuilderPage({
  searchParams,
}: {
  searchParams: { template?: string };
}) {
  const requested = searchParams?.template;
  const template: TemplateId = VALID.includes(requested as TemplateId)
    ? (requested as TemplateId)
    : "modern";

  return <BuilderClient initialTemplate={template} />;
}
