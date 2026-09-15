import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { supabaseEnabled } from "@/lib/auth/config";
import { isValidEmail, normalizeEmail, EMAIL_INVALID_MESSAGE } from "@/lib/validation";
import { sendVerificationEmail, resolveOrigin } from "@/lib/auth/verification";
import { jsonError } from "@/lib/server/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (supabaseEnabled()) {
    return jsonError("Sign up is handled by Supabase in this environment.", 400);
  }
  try {
    const { name, email, password } = await req.json();

    if (!email || !isValidEmail(String(email))) {
      return jsonError(EMAIL_INVALID_MESSAGE, 400);
    }
    if (!password || String(password).length < 6) {
      return jsonError("Password must be at least 6 characters.", 400);
    }

    const normalizedEmail = normalizeEmail(String(email));
    const cleanName = name ? String(name).trim().slice(0, 120) : null;
    const origin = resolveOrigin(req);

    const existing = await prisma.profile.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // A verified account (local, Google, or Supabase) already owns this email.
      if (existing.emailVerified) {
        return jsonError("An account with this email already exists.", 409);
      }
      // Unverified local account re-signing up: refresh credentials and resend
      // the verification link instead of erroring out.
      await prisma.profile.update({
        where: { id: existing.id },
        data: {
          name: cleanName ?? existing.name,
          passwordHash: await hashPassword(String(password)),
        },
      });
      await sendVerificationEmail(
        { id: existing.id, email: existing.email, name: cleanName ?? existing.name },
        origin
      );
      return NextResponse.json({ needsVerification: true, email: normalizedEmail });
    }

    const profile = await prisma.profile.create({
      data: {
        email: normalizedEmail,
        name: cleanName,
        passwordHash: await hashPassword(String(password)),
        authProvider: "local",
        // emailVerified stays null until the user confirms via the emailed link.
      },
    });

    await sendVerificationEmail(
      { id: profile.id, email: profile.email, name: profile.name },
      origin
    );

    // No session is created — the account is inactive until email is confirmed.
    return NextResponse.json({ needsVerification: true, email: normalizedEmail });
  } catch (err) {
    console.error("POST /api/auth/signup failed:", err);
    return jsonError("We couldn't create your account. Please try again.", 500);
  }
}
