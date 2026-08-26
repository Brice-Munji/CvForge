import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setLocalSession } from "@/lib/auth/server";
import { supabaseEnabled } from "@/lib/auth/config";
import { isValidEmail } from "@/lib/validation";
import { jsonError } from "@/lib/server/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (supabaseEnabled()) {
    return jsonError("Sign up is handled by Supabase in this environment.", 400);
  }
  try {
    const { name, email, password } = await req.json();

    if (!email || !isValidEmail(String(email))) {
      return jsonError("Please enter a valid email address.", 400);
    }
    if (!password || String(password).length < 6) {
      return jsonError("Password must be at least 6 characters.", 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.profile.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return jsonError("An account with this email already exists.", 409);
    }

    const profile = await prisma.profile.create({
      data: {
        email: normalizedEmail,
        name: name ? String(name).trim().slice(0, 120) : null,
        passwordHash: await hashPassword(String(password)),
      },
    });

    await setLocalSession(profile.id);
    return NextResponse.json({
      user: { id: profile.id, email: profile.email, name: profile.name },
    });
  } catch (err) {
    console.error("POST /api/auth/signup failed:", err);
    return jsonError("We couldn't create your account. Please try again.", 500);
  }
}
