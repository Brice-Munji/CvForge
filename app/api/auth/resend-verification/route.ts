import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseEnabled } from "@/lib/auth/config";
import { isValidEmail, normalizeEmail, EMAIL_INVALID_MESSAGE } from "@/lib/validation";
import { sendVerificationEmail, resolveOrigin } from "@/lib/auth/verification";
import { jsonError } from "@/lib/server/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (supabaseEnabled()) {
    return jsonError("Email verification is handled by Supabase in this environment.", 400);
  }
  try {
    const { email } = await req.json();
    if (!email || !isValidEmail(String(email))) {
      return jsonError(EMAIL_INVALID_MESSAGE, 400);
    }
    const normalizedEmail = normalizeEmail(String(email));
    const profile = await prisma.profile.findUnique({ where: { email: normalizedEmail } });

    // Only send for a real, still-unverified local account — but always return
    // the same response so we never reveal whether an email is registered.
    if (profile && profile.passwordHash && !profile.emailVerified) {
      await sendVerificationEmail(
        { id: profile.id, email: profile.email, name: profile.name },
        resolveOrigin(req)
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/resend-verification failed:", err);
    return jsonError("We couldn't resend the verification email. Please try again.", 500);
  }
}
