import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { getOwnedCV, updateCV, deleteCV } from "@/lib/server/cv-service";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const cv = await getOwnedCV(auth.id, params.id);
    // Same 404 whether the CV doesn't exist or belongs to someone else —
    // never reveal the existence of another user's CV.
    if (!cv) return jsonError("CV not found.", 404);
    return NextResponse.json({ cv });
  } catch (err) {
    console.error("GET /api/cv/[id] failed:", err);
    return jsonError("We couldn't load this CV. Please try again.", 500);
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
    const result = await updateCV(auth.id, params.id, body);
    if (!result) return jsonError("CV not found.", 404);
    return NextResponse.json({ ok: true, updatedAt: result.updatedAt });
  } catch (err) {
    console.error("PATCH /api/cv/[id] failed:", err);
    return jsonError("We couldn't save your changes. Please try again.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const removed = await deleteCV(auth.id, params.id);
    if (!removed) return jsonError("CV not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cv/[id] failed:", err);
    return jsonError("We couldn't delete this CV. Please try again.", 500);
  }
}
