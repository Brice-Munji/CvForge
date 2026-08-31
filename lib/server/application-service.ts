import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clampString } from "@/lib/validation";
import {
  isApplicationStatus,
  type ApplicationStatus,
  type ApplicationStats,
} from "@/lib/application-types";

const S = clampString;

export interface ApplicationListItem {
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  jobLocation: string;
  applicationDate: string;
  createdAt: string;
  updatedAt: string;
  cvId: string | null;
  coverLetterId: string | null;
  cvTitle: string | null;
  coverLetterTitle: string | null;
  hasEmail: boolean;
}

export interface ApplicationDetail extends ApplicationListItem {
  jobDescription: string;
  companyWebsite: string;
  salaryRange: string;
  recruiterName: string;
  recruiterEmail: string;
  jobUrl: string;
  notes: string;
  email: { id: string; subject: string; content: string } | null;
}

const listInclude = {
  cv: { select: { title: true } },
  coverLetter: { select: { title: true } },
  email: { select: { id: true } },
} satisfies Prisma.ApplicationInclude;

type ListRow = Prisma.ApplicationGetPayload<{ include: typeof listInclude }>;

function readStatus(v: unknown): ApplicationStatus {
  return isApplicationStatus(v) ? v : "Saved";
}

function toListItem(row: ListRow): ApplicationListItem {
  return {
    id: row.id,
    companyName: row.companyName,
    jobTitle: row.jobTitle,
    status: readStatus(row.status),
    jobLocation: row.jobLocation,
    applicationDate: row.applicationDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    cvId: row.cvId,
    coverLetterId: row.coverLetterId,
    cvTitle: row.cv?.title ?? null,
    coverLetterTitle: row.coverLetter?.title ?? null,
    hasEmail: Boolean(row.email),
  };
}

export async function listApplications(
  userId: string
): Promise<ApplicationListItem[]> {
  const rows = await prisma.application.findMany({
    where: { userId },
    include: listInclude,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toListItem);
}

/** Validate that referenced CV / cover letter belong to the user. */
async function resolveRefs(
  userId: string,
  cvId?: string | null,
  coverLetterId?: string | null
) {
  let resolvedCv: string | null = null;
  let resolvedCl: string | null = null;
  if (cvId) {
    const c = await prisma.cV.findFirst({
      where: { id: cvId, userId },
      select: { id: true },
    });
    resolvedCv = c?.id ?? null;
  }
  if (coverLetterId) {
    const c = await prisma.coverLetter.findFirst({
      where: { id: coverLetterId, userId },
      select: { id: true },
    });
    resolvedCl = c?.id ?? null;
  }
  return { resolvedCv, resolvedCl };
}

function normalizeApplicationInput(body: Record<string, unknown>) {
  return {
    companyName: S(body.companyName, 200),
    jobTitle: S(body.jobTitle, 200),
    jobDescription: S(body.jobDescription, 20000),
    companyWebsite: S(body.companyWebsite, 300),
    jobLocation: S(body.jobLocation, 200),
    applicationDate: S(body.applicationDate, 60),
    salaryRange: S(body.salaryRange, 120),
    recruiterName: S(body.recruiterName, 160),
    recruiterEmail: S(body.recruiterEmail, 200),
    jobUrl: S(body.jobUrl, 500),
    notes: S(body.notes, 10000),
  };
}

export async function createApplication(
  userId: string,
  body: Record<string, unknown>
): Promise<ApplicationDetail> {
  const { resolvedCv, resolvedCl } = await resolveRefs(
    userId,
    body.cvId as string | null,
    body.coverLetterId as string | null
  );
  const n = normalizeApplicationInput(body);
  const status = readStatus(body.status);

  const row = await prisma.application.create({
    data: {
      userId,
      cvId: resolvedCv,
      coverLetterId: resolvedCl,
      status,
      ...n,
    },
    include: listInclude,
  });

  // Optionally attach an email created in the same flow.
  const emailBody = body.email as
    | { subject?: string; content?: string }
    | undefined;
  if (emailBody && (emailBody.subject || emailBody.content)) {
    await prisma.applicationEmail.create({
      data: {
        userId,
        applicationId: row.id,
        subject: S(emailBody.subject, 300),
        content: S(emailBody.content, 20000),
      },
    });
  }

  const detail = await getOwnedApplication(userId, row.id);
  return detail!;
}

export async function getOwnedApplication(
  userId: string,
  id: string
): Promise<ApplicationDetail | null> {
  const row = await prisma.application.findFirst({
    where: { id, userId },
    include: {
      ...listInclude,
      email: { select: { id: true, subject: true, content: true } },
    },
  });
  if (!row) return null;
  const base = toListItem(row as unknown as ListRow);
  return {
    ...base,
    jobDescription: row.jobDescription,
    companyWebsite: row.companyWebsite,
    salaryRange: row.salaryRange,
    recruiterName: row.recruiterName,
    recruiterEmail: row.recruiterEmail,
    jobUrl: row.jobUrl,
    notes: row.notes,
    email: row.email
      ? { id: row.email.id, subject: row.email.subject, content: row.email.content }
      : null,
  };
}

export async function updateApplication(
  userId: string,
  id: string,
  body: Record<string, unknown>
): Promise<{ updatedAt: string } | null> {
  const owned = await prisma.application.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return null;

  const data: Prisma.ApplicationUpdateInput = {};

  // Status-only patches are common (tracker); only touch provided fields.
  if (body.status !== undefined) data.status = readStatus(body.status);
  if (body.companyName !== undefined) data.companyName = S(body.companyName, 200);
  if (body.jobTitle !== undefined) data.jobTitle = S(body.jobTitle, 200);
  if (body.jobDescription !== undefined)
    data.jobDescription = S(body.jobDescription, 20000);
  if (body.companyWebsite !== undefined)
    data.companyWebsite = S(body.companyWebsite, 300);
  if (body.jobLocation !== undefined) data.jobLocation = S(body.jobLocation, 200);
  if (body.applicationDate !== undefined)
    data.applicationDate = S(body.applicationDate, 60);
  if (body.salaryRange !== undefined) data.salaryRange = S(body.salaryRange, 120);
  if (body.recruiterName !== undefined)
    data.recruiterName = S(body.recruiterName, 160);
  if (body.recruiterEmail !== undefined)
    data.recruiterEmail = S(body.recruiterEmail, 200);
  if (body.jobUrl !== undefined) data.jobUrl = S(body.jobUrl, 500);
  if (body.notes !== undefined) data.notes = S(body.notes, 10000);

  if (body.cvId !== undefined || body.coverLetterId !== undefined) {
    const { resolvedCv, resolvedCl } = await resolveRefs(
      userId,
      (body.cvId as string) ?? null,
      (body.coverLetterId as string) ?? null
    );
    if (body.cvId !== undefined) data.cv = resolvedCv ? { connect: { id: resolvedCv } } : { disconnect: true };
    if (body.coverLetterId !== undefined)
      data.coverLetter = resolvedCl
        ? { connect: { id: resolvedCl } }
        : { disconnect: true };
  }

  const row = await prisma.application.update({
    where: { id },
    data,
    select: { updatedAt: true },
  });
  return { updatedAt: row.updatedAt.toISOString() };
}

export async function deleteApplication(
  userId: string,
  id: string
): Promise<boolean> {
  const res = await prisma.application.deleteMany({ where: { id, userId } });
  return res.count > 0;
}

export async function getApplicationStats(
  userId: string
): Promise<ApplicationStats> {
  const rows = await prisma.application.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });
  const count = (s: string) =>
    rows.find((r) => r.status === s)?._count._all ?? 0;

  const total = rows.reduce((sum, r) => sum + r._count._all, 0);
  const interviews = count("Interview");
  const offers = count("Offer");
  const rejected = count("Rejected");
  // "Sent" = reached the employer (Applied and beyond).
  const applied = count("Applied") + interviews + offers + rejected;
  const active = count("Saved") + count("Preparing") + count("Applied") + interviews;

  return { total, active, applied, interviews, offers, rejected };
}
