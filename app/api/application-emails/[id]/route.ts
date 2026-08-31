import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import {
  getOwnedApplicationEmail,
  updateApplicationEmail,
  deleteApplicationEmail,
} from "@/lib/server/application-email-service";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const email = await getOwnedApplicationEmail(auth.id, params.id);
    if (!email) return jsonError("Email not found.", 404);
    return NextResponse.json({ email });
  } catch (err) {
    console.error("GET /api/application-emails/[id] failed:", err);
    return jsonError("We couldn't load this email. Please try again.", 500);
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
    const result = await updateApplicationEmail(auth.id, params.id, {
      subject: body.subject as string | undefined,
      content: body.content as string | undefined,
    });
    if (!result) return jsonError("Email not found.", 404);
    return NextResponse.json({ ok: true, updatedAt: result.updatedAt });
  } catch (err) {
    console.error("PATCH /api/application-emails/[id] failed:", err);
    return jsonError("We couldn't save your changes. Please try again.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const removed = await deleteApplicationEmail(auth.id, params.id);
    if (!removed) return jsonError("Email not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/application-emails/[id] failed:", err);
    return jsonError("We couldn't delete this email. Please try again.", 500);
  }
}
