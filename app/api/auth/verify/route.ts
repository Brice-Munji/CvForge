import { NextResponse } from "next/server";
import { consumeVerificationToken, resolveOrigin } from "@/lib/auth/verification";
import { createSessionToken } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Handle the emailed verification link. On success the account is marked
 * verified, the user is logged in, and sent to the dashboard. On failure they
 * are sent to the login page with an error banner.
 */
export async function GET(req: Request) {
  const origin = resolveOrigin(req);
  const token = new URL(req.url).searchParams.get("token");

  const userId = await consumeVerificationToken(token);
  if (!userId) {
    return NextResponse.redirect(`${origin}/login?verify=invalid`, { status: 303 });
  }

  const sessionToken = await createSessionToken(userId);
  const res = NextResponse.redirect(`${origin}/dashboard?verified=1`, { status: 303 });
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
