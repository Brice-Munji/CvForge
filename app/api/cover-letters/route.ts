import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import {
  listCoverLetters,
  createCoverLetter,
} from "@/lib/server/cover-letter-service";
import { getOwnedCV } from "@/lib/server/cv-service";
import { checkAccess, upgradeResponse } from "@/lib/server/gate";
import { buildStarterContent, todayLong } from "@/lib/coverletter-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json({ coverLetters: await listCoverLetters(auth.id) });
  } catch (err) {
    console.error("GET /api/cover-letters failed:", err);
    return jsonError("We couldn't load your cover letters. Please try again.", 500);
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    // Cover letters are a Pro feature — enforced server-side.
    const access = await checkAccess(auth.id, "COVER_LETTERS");
    if (!access.allowed) return upgradeResponse(access);

    const body = await req.json().catch(() => ({}));
    const cvId: string | undefined = body?.cvId || undefined;

    // Build starter content from the selected (owned) CV, if any.
    const cv = cvId ? await getOwnedCV(auth.id, cvId) : null;
    const meta = {
      companyName: body?.companyName ?? "",
      jobTitle: body?.jobTitle ?? "",
      hiringManager: body?.hiringManager ?? "",
      companyLocation: body?.companyLocation ?? "",
    };
    const content = buildStarterContent(cv?.data ?? null, meta, todayLong());

    const title =
      body?.title ||
      (meta.companyName
        ? `${meta.jobTitle || "Cover letter"} — ${meta.companyName}`
        : "Untitled cover letter");

    const created = await createCoverLetter(auth.id, {
      cvId: cv?.id ?? null,
      title,
      companyName: meta.companyName,
      jobTitle: meta.jobTitle,
      hiringManager: meta.hiringManager,
      companyLocation: meta.companyLocation,
      jobDescription: body?.jobDescription ?? "",
      template: body?.template,
      content,
    });
    return NextResponse.json({ coverLetter: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cover-letters failed:", err);
    return jsonError("We couldn't create your cover letter. Please try again.", 500);
  }
}
