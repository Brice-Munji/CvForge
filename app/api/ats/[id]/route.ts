import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { getOwnedAnalysis, deleteAnalysis } from "@/lib/server/ats-service";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const analysis = await getOwnedAnalysis(auth.id, params.id);
    // Same 404 whether it doesn't exist or belongs to someone else —
    // never reveal another user's analysis.
    if (!analysis) return jsonError("Analysis not found.", 404);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("GET /api/ats/[id] failed:", err);
    return jsonError("We couldn't load this analysis. Please try again.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const removed = await deleteAnalysis(auth.id, params.id);
    if (!removed) return jsonError("Analysis not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/ats/[id] failed:", err);
    return jsonError("We couldn't delete this analysis. Please try again.", 500);
  }
}
