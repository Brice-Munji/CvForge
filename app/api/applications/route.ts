import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import {
  listApplications,
  createApplication,
} from "@/lib/server/application-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json({ applications: await listApplications(auth.id) });
  } catch (err) {
    console.error("GET /api/applications failed:", err);
    return jsonError("We couldn't load your applications. Please try again.", 500);
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json().catch(() => ({}));
    const application = await createApplication(auth.id, body);
    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    console.error("POST /api/applications failed:", err);
    return jsonError("We couldn't create your application. Please try again.", 500);
  }
}
