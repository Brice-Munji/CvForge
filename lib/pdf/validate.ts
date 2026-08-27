import type { CVData } from "@/lib/cv-types";

export interface ExportValidation {
  ok: boolean;
  message?: string;
  missing: string[];
}

/**
 * A CV must have at least a name and some real content before it's worth
 * exporting — but we never require every optional section.
 */
export function validateForExport(data: CVData): ExportValidation {
  const missing: string[] = [];

  if (!data.personal.fullName.trim()) missing.push("your full name");

  const hasContent =
    data.summary.trim().length > 0 ||
    data.experiences.length > 0 ||
    data.educations.length > 0 ||
    data.skills.length > 0;

  if (!hasContent) {
    missing.push("at least one experience, education entry, or some skills");
  }

  if (missing.length === 0) return { ok: true, missing };

  return {
    ok: false,
    missing,
    message: "Add some information to your CV before downloading.",
  };
}
