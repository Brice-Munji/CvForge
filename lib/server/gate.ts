import "server-only";
import { NextResponse } from "next/server";
import { getPlanContext } from "@/lib/server/billing";
import { canAccess, type Feature, type AccessResult } from "@/lib/entitlements";

/** Evaluate an entitlement for a user using the server-side plan context. */
export async function checkAccess(
  userId: string,
  feature: Feature,
  extra?: { template?: string }
): Promise<AccessResult> {
  const ctx = await getPlanContext(userId);
  return canAccess({ planId: ctx.planId, usage: ctx.usage }, feature, extra);
}

/** Standard 403 upgrade response consumed by the client to open the upgrade modal. */
export function upgradeResponse(access: Extract<AccessResult, { allowed: false }>) {
  return NextResponse.json(
    {
      error: access.message,
      code: "UPGRADE_REQUIRED",
      feature: access.feature,
      reason: access.reason,
    },
    { status: 403 }
  );
}
