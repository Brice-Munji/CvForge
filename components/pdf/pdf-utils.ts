import type { CVData, PersonalInfo } from "@/lib/cv-types";

export interface PdfFlags {
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  languages: boolean;
  anyBody: boolean;
}

export function pdfFlags(data: CVData): PdfFlags {
  const f = {
    summary: Boolean(data.summary?.trim()),
    experience: data.experiences.length > 0,
    education: data.educations.length > 0,
    skills: data.skills.length > 0,
    projects: data.projects.length > 0,
    certifications: data.certifications.length > 0,
    languages: data.languages.length > 0,
  };
  return { ...f, anyBody: Object.values(f).some(Boolean) };
}

export function pdfDate(start: string, end: string, current?: boolean): string {
  return [start, current ? "Present" : end].filter(Boolean).join(" – ");
}

export function contactList(p: PersonalInfo, order: (keyof PersonalInfo)[]): string {
  return order
    .map((k) => p[k])
    .filter((v) => v && v.trim())
    .join("   •   ");
}

export const SKILL_PCT: Record<string, number> = {
  Beginner: 35,
  Intermediate: 60,
  Advanced: 82,
  Expert: 100,
};
