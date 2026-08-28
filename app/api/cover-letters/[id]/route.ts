import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import {
  getOwnedCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
} from "@/lib/server/cover-letter-service";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const cl = await getOwnedCoverLetter(auth.id, params.id);
    if (!cl) return jsonError("Cover letter not found.", 404);
    return NextResponse.json({ coverLetter: cl });
  } catch (err) {
    console.error("GET /api/cover-letters/[id] failed:", err);
    return jsonError("We couldn't load this cover letter. Please try again.", 500);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid request body.", 400);
    }
    const result = await updateCoverLetter(auth.id, params.id, body);
    if (!result) return jsonError("Cover letter not found.", 404);
    return NextResponse.json({ ok: true, updatedAt: result.updatedAt });
  } catch (err) {
    console.error("PATCH /api/cover-letters/[id] failed:", err);
    return jsonError("We couldn't save your changes. Please try again.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const removed = await deleteCoverLetter(auth.id, params.id);
    if (!removed) return jsonError("Cover letter not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cover-letters/[id] failed:", err);
    return jsonError("We couldn't delete this cover letter. Please try again.", 500);
  }
}
