import { NextResponse } from "next/server";
import { getAuthUser, type AuthUser } from "@/lib/auth/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Resolve the authenticated (and not disabled) user for an API route, or return
 * a 401/403 response.
 *   const auth = await requireUser();
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireUser(): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser();
  if (!user) return jsonError("You need to be signed in to do that.", 401);
  if (user.disabled) {
    return jsonError("Your account has been disabled. Please contact support.", 403);
  }
  return user;
}

/**
 * Resolve the authenticated ADMIN user for an admin API route, or return
 * 401/403. Authorization is ALWAYS verified here, server-side.
 */
export async function requireAdmin(): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser();
  if (!user) return jsonError("You need to be signed in to do that.", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden.", 403);
  return user;
}
