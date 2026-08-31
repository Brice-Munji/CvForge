import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clampString } from "@/lib/validation";
import {
  type CoverLetterData,
  type CoverLetterTemplateId,
  type CoverLetterContent,
  emptyCoverLetterContent,
} from "@/lib/coverletter-types";

type Row = Prisma.CoverLetterGetPayload<{}>;

export interface CoverLetterListItem {
  id: string;
  title: string;
  cvId: string | null;
  companyName: string;
  jobTitle: string;
  template: CoverLetterTemplateId;
  updatedAt: string;
  createdAt: string;
  data: CoverLetterData;
}

const TEMPLATES: CoverLetterTemplateId[] = ["classic", "modern"];
const S = clampString;

function readTemplate(v: unknown): CoverLetterTemplateId {
  return TEMPLATES.includes(v as CoverLetterTemplateId)
    ? (v as CoverLetterTemplateId)
    : "classic";
}

function readContent(v: unknown): CoverLetterContent {
  const c = (v ?? {}) as Record<string, unknown>;
  const base = emptyCoverLetterContent();
  return {
    date: S(c.date, 60) || base.date,
    subject: S(c.subject, 200),
    greeting: S(c.greeting, 200),
    opening: S(c.opening, 3000),
    body: S(c.body, 8000),
    closing: S(c.closing, 3000),
    signature: S(c.signature, 160),
    senderName: S(c.senderName, 160),
    senderTitle: S(c.senderTitle, 160),
    senderEmail: S(c.senderEmail, 200),
    senderPhone: S(c.senderPhone, 60),
    senderLocation: S(c.senderLocation, 160),
  };
}

function toItem(row: Row): CoverLetterListItem {
  const template = readTemplate(row.template);
  return {
    id: row.id,
    title: row.title,
    cvId: row.cvId,
    companyName: row.companyName,
    jobTitle: row.jobTitle,
    template,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    data: {
      template,
      companyName: row.companyName,
      jobTitle: row.jobTitle,
      hiringManager: row.hiringManager,
      companyLocation: row.companyLocation,
      jobDescription: row.jobDescription,
      content: readContent(row.content),
    },
  };
}

export async function listCoverLetters(
  userId: string
): Promise<CoverLetterListItem[]> {
  const rows = await prisma.coverLetter.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toItem);
}

export async function createCoverLetter(
  userId: string,
  input: {
    cvId?: string | null;
    title?: string;
    companyName?: string;
    jobTitle?: string;
    hiringManager?: string;
    companyLocation?: string;
    jobDescription?: string;
    template?: CoverLetterTemplateId;
    content: CoverLetterContent;
  }
): Promise<CoverLetterListItem> {
  // Verify the referenced CV belongs to the user (never trust the client).
  let cvId: string | null = null;
  if (input.cvId) {
    const owned = await prisma.cV.findFirst({
      where: { id: input.cvId, userId },
      select: { id: true },
    });
    cvId = owned?.id ?? null;
  }

  const row = await prisma.coverLetter.create({
    data: {
      userId,
      cvId,
      title: input.title?.trim() || "Untitled cover letter",
      companyName: S(input.companyName, 200),
      jobTitle: S(input.jobTitle, 200),
      hiringManager: S(input.hiringManager, 160),
      companyLocation: S(input.companyLocation, 160),
      jobDescription: S(input.jobDescription, 20000),
      template: readTemplate(input.template),
      content: input.content as unknown as Prisma.InputJsonValue,
    },
  });
  return toItem(row);
}

export async function getOwnedCoverLetter(
  userId: string,
  id: string
): Promise<CoverLetterListItem | null> {
  const row = await prisma.coverLetter.findFirst({ where: { id, userId } });
  return row ? toItem(row) : null;
}

export async function updateCoverLetter(
  userId: string,
  id: string,
  body: Record<string, unknown>
): Promise<{ updatedAt: string } | null> {
  const owned = await prisma.coverLetter.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return null;

  const data: Prisma.CoverLetterUpdateInput = {
    template: readTemplate(body.template),
    companyName: S(body.companyName, 200),
    jobTitle: S(body.jobTitle, 200),
    hiringManager: S(body.hiringManager, 160),
    companyLocation: S(body.companyLocation, 160),
    jobDescription: S(body.jobDescription, 20000),
    content: readContent(body.content) as unknown as Prisma.InputJsonValue,
  };
  if (body.title !== undefined)
    data.title = S(body.title, 160) || "Untitled cover letter";

  const row = await prisma.coverLetter.update({
    where: { id },
    data,
    select: { updatedAt: true },
  });
  return { updatedAt: row.updatedAt.toISOString() };
}

export async function deleteCoverLetter(
  userId: string,
  id: string
): Promise<boolean> {
  const res = await prisma.coverLetter.deleteMany({ where: { id, userId } });
  return res.count > 0;
}
