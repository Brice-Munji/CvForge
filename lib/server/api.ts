import { NextResponse } from "next/server";
import { getAuthUser, type AuthUser } from "@/lib/auth/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Resolve the authenticated user for an API route, or return a 401 response.
 * Usage:
 *   const auth = await requireUser();
 *   if (auth instanceof NextResponse) return auth;
 *   // auth is AuthUser
 */
export async function requireUser(): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser();
  if (!user) return jsonError("You need to be signed in to do that.", 401);
  return user;
}
