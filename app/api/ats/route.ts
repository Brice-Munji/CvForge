import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { getOwnedCV } from "@/lib/server/cv-service";
import {
  runAndSaveAnalysis,
  listAnalyses,
  type RunAnalysisInput,
} from "@/lib/server/ats-service";
import { checkAccess, upgradeResponse } from "@/lib/server/gate";
import { syncUsageRow } from "@/lib/server/billing";
import type { AtsMode } from "@/lib/ats/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json({ analyses: await listAnalyses(auth.id) });
  } catch (err) {
    console.error("GET /api/ats failed:", err);
    return jsonError("We couldn't load your ATS checks. Please try again.", 500);
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    // Usage limit is enforced server-side (free plan gets a monthly quota).
    const access = await checkAccess(auth.id, "ATS_ANALYZER");
    if (!access.allowed) return upgradeResponse(access);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const cvId = typeof body.cvId === "string" ? body.cvId : "";
    if (!cvId) return jsonError("Please choose a CV to analyze.", 400);

    // Ownership check — only the user's own CV can be analyzed.
    const cv = await getOwnedCV(auth.id, cvId);
    if (!cv) return jsonError("CV not found.", 404);

    const mode: AtsMode = body.mode === "JOB" ? "JOB" : "CV";
    const input: RunAnalysisInput = {
      cvData: cv.data,
      cvId: cv.id,
      cvTitle: cv.title,
      mode,
      jobTitle: typeof body.jobTitle === "string" ? body.jobTitle : "",
      jobDescription:
        typeof body.jobDescription === "string" ? body.jobDescription : "",
    };

    const result = await runAndSaveAnalysis(auth.id, input);
    if (!result.ok) return jsonError(result.message, 400);

    await syncUsageRow(auth.id);
    return NextResponse.json({ analysis: result.item }, { status: 201 });
  } catch (err) {
    console.error("POST /api/ats failed:", err);
    return jsonError("We couldn't run your ATS check. Please try again.", 500);
  }
}
