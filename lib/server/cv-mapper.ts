import type { Prisma } from "@prisma/client";
import {
  TEMPLATE_IDS,
  type CVData,
  type TemplateId,
  type PersonalInfo,
  emptyPersonal,
} from "@/lib/cv-types";
import { clampString, asBoolean } from "@/lib/validation";

/** Prisma include for a fully-loaded CV. */
export const cvInclude = {
  experiences: { orderBy: { order: "asc" } },
  educations: { orderBy: { order: "asc" } },
  skills: { orderBy: { order: "asc" } },
  projects: { orderBy: { order: "asc" } },
  certifications: { orderBy: { order: "asc" } },
  languages: { orderBy: { order: "asc" } },
} satisfies Prisma.CVInclude;

export type CVWithRelations = Prisma.CVGetPayload<{ include: typeof cvInclude }>;

function readTemplate(value: unknown): TemplateId {
  return TEMPLATE_IDS.includes(value as TemplateId)
    ? (value as TemplateId)
    : "classic";
}

function readPersonal(value: unknown): PersonalInfo {
  const v = (value ?? {}) as Record<string, unknown>;
  return {
    fullName: clampString(v.fullName, 120),
    title: clampString(v.title, 120),
    email: clampString(v.email, 160),
    phone: clampString(v.phone, 60),
    location: clampString(v.location, 120),
    linkedin: clampString(v.linkedin, 200),
    portfolio: clampString(v.portfolio, 200),
  };
}

/** Map a persisted CV (with relations) to the template-independent CVData. */
export function cvToData(cv: CVWithRelations): CVData {
  return {
    template: readTemplate(cv.template),
    personal: cv.personalInfo ? readPersonal(cv.personalInfo) : { ...emptyPersonal },
    summary: cv.summary ?? "",
    experiences: cv.experiences.map((e) => ({
      id: e.id,
      position: e.position,
      company: e.company,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      description: e.description,
    })),
    educations: cv.educations.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
    })),
    skills: cv.skills.map((s) => ({
      id: s.id,
      name: s.name,
      level: s.level as CVData["skills"][number]["level"],
    })),
    projects: cv.projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      technologies: p.technologies,
      url: p.url,
    })),
    certifications: cv.certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      date: c.date,
      url: c.url,
    })),
    languages: cv.languages.map((l) => ({
      id: l.id,
      name: l.name,
      level: l.level as CVData["languages"][number]["level"],
    })),
  };
}

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const S = clampString;

/**
 * Normalize an untrusted incoming CV payload into safe values for persistence.
 * Only known fields are read; everything is length-capped and typed.
 */
export function normalizeCVInput(body: Record<string, unknown>) {
  const personal = readPersonal(body.personal);
  const template = readTemplate(body.template);
  const summary = S(body.summary, 2000);
  const title = body.title !== undefined ? S(body.title, 120) : undefined;

  const experiences = arr(body.experiences).slice(0, 40).map((raw, i) => {
    const e = raw as Record<string, unknown>;
    return {
      position: S(e.position, 160),
      company: S(e.company, 160),
      location: S(e.location, 120),
      startDate: S(e.startDate, 40),
      endDate: S(e.endDate, 40),
      current: asBoolean(e.current),
      description: S(e.description, 3000),
      order: i,
    };
  });

  const educations = arr(body.educations).slice(0, 40).map((raw, i) => {
    const e = raw as Record<string, unknown>;
    return {
      institution: S(e.institution, 160),
      degree: S(e.degree, 160),
      field: S(e.field, 160),
      startDate: S(e.startDate, 40),
      endDate: S(e.endDate, 40),
      description: S(e.description, 2000),
      order: i,
    };
  });

  const skills = arr(body.skills).slice(0, 100).map((raw, i) => {
    const s = raw as Record<string, unknown>;
    return {
      name: S(s.name, 80),
      level: S(s.level, 40) || "Intermediate",
      order: i,
    };
  });

  const projects = arr(body.projects).slice(0, 40).map((raw, i) => {
    const p = raw as Record<string, unknown>;
    return {
      name: S(p.name, 160),
      description: S(p.description, 3000),
      technologies: arr(p.technologies)
        .slice(0, 30)
        .map((t) => S(t, 40))
        .filter(Boolean),
      url: S(p.url, 300),
      order: i,
    };
  });

  const certifications = arr(body.certifications).slice(0, 40).map((raw, i) => {
    const c = raw as Record<string, unknown>;
    return {
      name: S(c.name, 200),
      issuer: S(c.issuer, 200),
      date: S(c.date, 60),
      url: S(c.url, 300),
      order: i,
    };
  });

  const languages = arr(body.languages).slice(0, 40).map((raw, i) => {
    const l = raw as Record<string, unknown>;
    return {
      name: S(l.name, 80),
      level: S(l.level, 40) || "Conversational",
      order: i,
    };
  });

  return {
    title,
    template,
    personal,
    summary,
    experiences,
    educations,
    skills,
    projects,
    certifications,
    languages,
  };
}
