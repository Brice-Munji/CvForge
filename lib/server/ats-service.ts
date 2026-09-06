import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clampString } from "@/lib/validation";
import type { CVData } from "@/lib/cv-types";
import type { AtsMode, AtsResult } from "@/lib/ats/types";
import { analyzeCv, matchJob } from "@/lib/ats/analyzer";

export const MAX_JOB_DESCRIPTION = 20000;
export const MAX_JOB_TITLE = 200;
/** A job description shorter than this is treated as invalid input. */
export const MIN_JOB_DESCRIPTION = 30;

export interface AtsAnalysisItem {
  id: string;
  cvId: string | null;
  cvTitle: string;
  mode: AtsMode;
  title: string;
  jobTitle: string;
  jobDescription: string;
  score: number;
  result: AtsResult;
  createdAt: string;
}

type Row = Prisma.AtsAnalysisGetPayload<{ include: { cv: { select: { title: true } } } }>;

function toItem(row: Row): AtsAnalysisItem {
  return {
    id: row.id,
    cvId: row.cvId,
    cvTitle: row.cv?.title ?? "Deleted CV",
    mode: (row.mode === "JOB" ? "JOB" : "CV") as AtsMode,
    title: row.title,
    jobTitle: row.jobTitle,
    jobDescription: row.jobDescription,
    score: row.score,
    result: row.result as unknown as AtsResult,
    createdAt: row.createdAt.toISOString(),
  };
}

export type RunAnalysisInput = {
  cvData: CVData;
  cvId: string | null;
  cvTitle: string;
  mode: AtsMode;
  jobTitle?: string;
  jobDescription?: string;
};

export type RunAnalysisError =
  | { ok: false; code: "INVALID_INPUT"; message: string };

export type RunAnalysisResult =
  | { ok: true; item: AtsAnalysisItem }
  | RunAnalysisError;

/**
 * Run the deterministic analyzer and persist the result for the user.
 * Ownership of the CV is verified by the caller (a CV that isn't the user's is
 * never passed in). The saved row is always scoped to `userId`.
 */
export async function runAndSaveAnalysis(
  userId: string,
  input: RunAnalysisInput
): Promise<RunAnalysisResult> {
  const mode: AtsMode = input.mode === "JOB" ? "JOB" : "CV";
  const jobTitle = clampString(input.jobTitle, MAX_JOB_TITLE).trim();
  const jobDescription = clampString(
    input.jobDescription,
    MAX_JOB_DESCRIPTION
  ).trim();

  if (mode === "JOB" && jobDescription.length < MIN_JOB_DESCRIPTION) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message:
        "Please paste a job description (at least a few sentences) to match against.",
    };
  }

  const result: AtsResult =
    mode === "JOB"
      ? matchJob(input.cvData, jobTitle, jobDescription)
      : analyzeCv(input.cvData);

  const title =
    mode === "JOB"
      ? `Match: ${jobTitle || "Job"} — ${input.cvTitle}`
      : `CV Check — ${input.cvTitle}`;

  const row = await prisma.atsAnalysis.create({
    data: {
      userId,
      cvId: input.cvId,
      mode,
      title: clampString(title, 200),
      jobTitle,
      jobDescription,
      score: result.score,
      result: result as unknown as Prisma.InputJsonValue,
    },
    include: { cv: { select: { title: true } } },
  });

  return { ok: true, item: toItem(row) };
}

/** All analyses owned by the user, newest first. */
export async function listAnalyses(userId: string): Promise<AtsAnalysisItem[]> {
  const rows = await prisma.atsAnalysis.findMany({
    where: { userId },
    include: { cv: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map(toItem);
}

/** Load a single analysis only if it belongs to the user. Null otherwise. */
export async function getOwnedAnalysis(
  userId: string,
  id: string
): Promise<AtsAnalysisItem | null> {
  const row = await prisma.atsAnalysis.findFirst({
    where: { id, userId },
    include: { cv: { select: { title: true } } },
  });
  return row ? toItem(row) : null;
}

/** Delete an analysis owned by the user. Returns true if a row was removed. */
export async function deleteAnalysis(
  userId: string,
  id: string
): Promise<boolean> {
  const res = await prisma.atsAnalysis.deleteMany({ where: { id, userId } });
  return res.count > 0;
}
