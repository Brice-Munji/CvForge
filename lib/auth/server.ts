import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  supabaseEnabled,
  isBootstrapAdminEmail,
} from "./config";
import { createSessionToken, verifySessionToken } from "./session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  disabled: boolean;
}

type ProfileRow = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  disabled: boolean;
};

/** Promote configured bootstrap-admin emails to the ADMIN role (once). */
async function withAdminBootstrap(p: ProfileRow): Promise<ProfileRow> {
  if (p.role !== "ADMIN" && isBootstrapAdminEmail(p.email)) {
    try {
      await prisma.profile.update({
        where: { id: p.id },
        data: { role: "ADMIN" },
      });
      return { ...p, role: "ADMIN" };
    } catch {
      /* ignore */
    }
  }
  return p;
}

function toAuthUser(p: ProfileRow): AuthUser {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    avatarUrl: p.avatarUrl,
    role: p.role,
    disabled: p.disabled,
  };
}

/**
 * Ensure a Profile row exists for a Supabase-authenticated user (created on
 * first login), returning it. Idempotent — never creates duplicates.
 */
async function ensureProfile(input: {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<AuthUser> {
  const profile = await prisma.profile.upsert({
    where: { id: input.id },
    update: {
      email: input.email,
      ...(input.name ? { name: input.name } : {}),
      ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
    },
    create: {
      id: input.id,
      email: input.email,
      name: input.name ?? null,
      avatarUrl: input.avatarUrl ?? null,
    },
  });
  return toAuthUser(await withAdminBootstrap(profile));
}

/**
 * Resolve the currently authenticated user (or null), server-side only.
 * The authenticated identity is ALWAYS determined here — never trusted from
 * the client.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  if (supabaseEnabled()) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = user.user_metadata ?? {};
    return ensureProfile({
      id: user.id,
      email: user.email ?? meta.email ?? "",
      name: meta.full_name ?? meta.name ?? null,
      avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    });
  }

  // Local provider
  const token = cookies().get(SESSION_COOKIE)?.value;
  const uid = await verifySessionToken(token);
  if (!uid) return null;
  const profile = await prisma.profile.findUnique({ where: { id: uid } });
  if (!profile) return null;
  return toAuthUser(await withAdminBootstrap(profile));
}

/** True when the authenticated user has the ADMIN role. */
export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

/** Set the local session cookie for a profile id (local provider only). */
export async function setLocalSession(uid: string) {
  const token = await createSessionToken(uid);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearLocalSession() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
