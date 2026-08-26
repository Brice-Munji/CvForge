import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { createCV, listCVs } from "@/lib/server/cv-service";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/cv-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const cvs = await listCVs(auth.id);
    return NextResponse.json({ cvs });
  } catch (err) {
    console.error("GET /api/cv failed:", err);
    return jsonError("We couldn't load your CVs. Please try again.", 500);
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    let template: TemplateId = "classic";
    let title: string | undefined;
    try {
      const body = await req.json();
      if (TEMPLATE_IDS.includes(body?.template)) template = body.template;
      if (typeof body?.title === "string") title = body.title;
    } catch {
      /* empty body is fine */
    }
    const cv = await createCV(auth.id, { template, title });
    return NextResponse.json({ cv }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cv failed:", err);
    return jsonError("We couldn't create your CV. Please try again.", 500);
  }
}
