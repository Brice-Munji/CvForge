import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { createApplicationEmail } from "@/lib/server/application-email-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json().catch(() => ({}));
    const result = await createApplicationEmail(auth.id, {
      applicationId: body?.applicationId ?? null,
      subject: body?.subject ?? "",
      content: body?.content ?? "",
    });
    if ("error" in result) {
      if (result.error === "app_not_found")
        return jsonError("Application not found.", 404);
      return jsonError("This application already has an email.", 409);
    }
    return NextResponse.json({ email: result }, { status: 201 });
  } catch (err) {
    console.error("POST /api/application-emails failed:", err);
    return jsonError("We couldn't create the email. Please try again.", 500);
  }
}
