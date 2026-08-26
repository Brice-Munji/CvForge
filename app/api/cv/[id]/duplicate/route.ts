import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { duplicateCV } from "@/lib/server/cv-service";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const cv = await duplicateCV(auth.id, params.id);
    if (!cv) return jsonError("CV not found.", 404);
    return NextResponse.json({ cv }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cv/[id]/duplicate failed:", err);
    return jsonError("We couldn't duplicate this CV. Please try again.", 500);
  }
}
