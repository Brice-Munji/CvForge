import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { getOwnedCoverLetter } from "@/lib/server/cover-letter-service";
import { checkAccess, upgradeResponse } from "@/lib/server/gate";
import { renderCoverLetterToBuffer } from "@/lib/pdf/render-cover-letter";
import { coverLetterFileName } from "@/lib/pdf/filename";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const cl = await getOwnedCoverLetter(auth.id, params.id);
    if (!cl) return jsonError("Cover letter not found.", 404);

    // Cover letters (incl. their export) are a Pro feature.
    const access = await checkAccess(auth.id, "COVER_LETTERS");
    if (!access.allowed) return upgradeResponse(access);

    const c = cl.data.content;
    const hasContent =
      c.opening.trim() || c.body.trim() || c.closing.trim() || c.subject.trim();
    if (!hasContent) {
      return jsonError(
        "Add some content to your cover letter before downloading.",
        422
      );
    }

    const buffer = await renderCoverLetterToBuffer(cl.data);
    const filename = coverLetterFileName(c.senderName);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
          filename
        )}`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("POST /api/cover-letters/[id]/export failed:", err);
    return jsonError(
      "Something went wrong while creating your PDF. Please try again.",
      500
    );
  }
}
