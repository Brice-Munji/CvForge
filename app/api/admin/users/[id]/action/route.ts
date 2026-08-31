import { NextResponse } from "next/server";
import { requireAdmin, jsonError } from "@/lib/server/api";
import {
  grantPro,
  revokePro,
  changeRole,
  setDisabled,
} from "@/lib/server/admin-actions";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");
    const userId = params.id;
    const reason = String(body?.reason ?? "").slice(0, 500);

    let result;
    switch (action) {
      case "grant_pro":
        result = await grantPro(admin.id, userId, reason);
        break;
      case "revoke_pro":
        result = await revokePro(admin.id, userId, reason);
        break;
      case "change_role":
        result = await changeRole(admin.id, userId, String(body?.role ?? ""));
        break;
      case "disable":
        result = await setDisabled(admin.id, userId, true);
        break;
      case "enable":
        result = await setDisabled(admin.id, userId, false);
        break;
      default:
        return jsonError("Unknown action.", 400);
    }

    if (!result.ok) return jsonError(result.error, 400);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/admin/users/[id]/action failed:", err);
    return jsonError("The action couldn't be completed. Please try again.", 500);
  }
}
