import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/server/api";
import { createCheckout } from "@/lib/payments/activate";
import { isPaidPlan } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan ?? "");
    if (!isPaidPlan(plan)) return jsonError("Please choose a valid Pro plan.", 400);

    const origin =
      req.headers.get("origin") || new URL(req.url).origin;
    const result = await createCheckout(auth.id, plan, origin);
    if ("error" in result) return jsonError(result.error, 400);

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/payments/checkout failed:", err);
    return jsonError("We couldn't start the payment. Please try again.", 500);
  }
}
