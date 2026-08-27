import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { getOwnedCV, recordExportEvent } from "@/lib/server/cv-service";
import { renderCvToBuffer } from "@/lib/pdf/render";
import { validateForExport } from "@/lib/pdf/validate";
import { cvFileName } from "@/lib/pdf/filename";

export const dynamic = "force-dynamic";
// PDF rendering (fontkit / layout) needs the Node.js runtime.
export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const cv = await getOwnedCV(auth.id, params.id);
    // Same safe not-found for missing and other-users' CVs.
    if (!cv) return jsonError("CV not found.", 404);

    const validation = validateForExport(cv.data);
    if (!validation.ok) {
      return jsonError(
        validation.message || "Add some information to your CV before downloading.",
        422
      );
    }

    const buffer = await renderCvToBuffer(cv.data, { title: cv.title });

    await recordExportEvent(auth.id, cv.id, cv.data.template);

    const filename = cvFileName(cv.data.personal.fullName);
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
    console.error("POST /api/cv/[id]/export failed:", err);
    return jsonError(
      "Something went wrong while creating your PDF. Please try again.",
      500
    );
  }
}
