import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseEnabled } from "@/lib/auth/config";
import { setLocalSession } from "@/lib/auth/server";
import { verifyGoogleIdToken, googleSignInConfigured } from "@/lib/auth/google";
import { normalizeEmail } from "@/lib/validation";
import { jsonError } from "@/lib/server/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * "Continue with Google" for the built-in local auth provider. Accepts a Google
 * Identity Services ID token, verifies it on the backend, then logs the user in
 * — creating an account on first sign-in and reusing the existing account
 * (matched by verified email) on subsequent sign-ins. Never creates duplicates.
 */
export async function POST(req: Request) {
  if (supabaseEnabled()) {
    // In Supabase mode, Google OAuth is handled by Supabase's redirect flow.
    return jsonError("Google sign-in is handled by Supabase in this environment.", 400);
  }
  if (!googleSignInConfigured()) {
    return jsonError("Google sign-in is not configured.", 400);
  }

  try {
    const { credential } = await req.json();

    let identity;
    try {
      identity = await verifyGoogleIdToken(String(credential || ""));
    } catch (err) {
      console.warn("Google token verification failed:", (err as Error).message);
      return jsonError("Could not verify your Google account. Please try again.", 401);
    }

    const email = normalizeEmail(identity.email);

    // Match by email to prevent duplicates: an email registered via password (or
    // a prior Google sign-in) reuses the SAME account. Google has verified the
    // email, so we can also mark a previously-unverified account as verified.
    const existing = await prisma.profile.findUnique({ where: { email } });

    let profile;
    if (existing) {
      if (existing.disabled) {
        return jsonError("This account has been disabled.", 403);
      }
      profile = await prisma.profile.update({
        where: { id: existing.id },
        data: {
          emailVerified: existing.emailVerified ?? new Date(),
          name: existing.name ?? identity.name,
          avatarUrl: existing.avatarUrl ?? identity.picture,
        },
      });
    } else {
      profile = await prisma.profile.create({
        data: {
          email,
          name: identity.name,
          avatarUrl: identity.picture,
          authProvider: "google",
          emailVerified: new Date(), // Google-verified email
          // no passwordHash — this account signs in with Google
        },
      });
    }

    await setLocalSession(profile.id);
    return NextResponse.json({
      user: { id: profile.id, email: profile.email, name: profile.name },
    });
  } catch (err) {
    console.error("POST /api/auth/google failed:", err);
    return jsonError("Something went wrong with Google sign-in. Please try again.", 500);
  }
}
