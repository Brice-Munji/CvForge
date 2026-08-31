import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import {
  listApplications,
  createApplication,
} from "@/lib/server/application-service";
import { checkAccess, upgradeResponse } from "@/lib/server/gate";
import { syncUsageRow } from "@/lib/server/billing";

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
    // Free plan application limit — enforced server-side.
    const access = await checkAccess(auth.id, "UNLIMITED_APPLICATIONS");
    if (!access.allowed) return upgradeResponse(access);

    const body = await req.json().catch(() => ({}));
    const application = await createApplication(auth.id, body);
    await syncUsageRow(auth.id);
    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    console.error("POST /api/applications failed:", err);
    return jsonError("We couldn't create your application. Please try again.", 500);
  }
}
