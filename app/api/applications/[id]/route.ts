import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import {
  getOwnedApplication,
  updateApplication,
  deleteApplication,
} from "@/lib/server/application-service";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const app = await getOwnedApplication(auth.id, params.id);
    if (!app) return jsonError("Application not found.", 404);
    return NextResponse.json({ application: app });
  } catch (err) {
    console.error("GET /api/applications/[id] failed:", err);
    return jsonError("We couldn't load this application. Please try again.", 500);
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
    const result = await updateApplication(auth.id, params.id, body);
    if (!result) return jsonError("Application not found.", 404);
    return NextResponse.json({ ok: true, updatedAt: result.updatedAt });
  } catch (err) {
    console.error("PATCH /api/applications/[id] failed:", err);
    return jsonError("We couldn't save your changes. Please try again.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const removed = await deleteApplication(auth.id, params.id);
    if (!removed) return jsonError("Application not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/applications/[id] failed:", err);
    return jsonError("We couldn't delete this application. Please try again.", 500);
  }
}
