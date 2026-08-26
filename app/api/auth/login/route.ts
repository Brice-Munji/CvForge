import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setLocalSession } from "@/lib/auth/server";
import { supabaseEnabled } from "@/lib/auth/config";
import { isValidEmail } from "@/lib/validation";
import { jsonError } from "@/lib/server/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (supabaseEnabled()) {
    return jsonError("Login is handled by Supabase in this environment.", 400);
  }
  try {
    const { email, password } = await req.json();

    if (!email || !isValidEmail(String(email))) {
      return jsonError("Please enter a valid email address.", 400);
    }
    if (!password) {
      return jsonError("Please enter your password.", 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const profile = await prisma.profile.findUnique({
      where: { email: normalizedEmail },
    });

    // Same message for unknown email and wrong password (no user enumeration).
    if (!profile || !profile.passwordHash) {
      return jsonError("Incorrect email or password.", 401);
    }
    const ok = await verifyPassword(String(password), profile.passwordHash);
    if (!ok) {
      return jsonError("Incorrect email or password.", 401);
    }

    await setLocalSession(profile.id);
    return NextResponse.json({
      user: { id: profile.id, email: profile.email, name: profile.name },
    });
  } catch (err) {
    console.error("POST /api/auth/login failed:", err);
    return jsonError("We couldn't log you in. Please try again.", 500);
  }
}
