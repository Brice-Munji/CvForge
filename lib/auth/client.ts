"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** The Google OAuth client id for the built-in (local) Google sign-in flow. */
export function googleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}

export type Result = { error?: string; data?: Record<string, unknown> };

async function apiJson(path: string, body: unknown): Promise<Result> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.error || "Something went wrong. Please try again.", data };
    }
    return { data };
  } catch {
    return { error: "Network error. Please check your connection." };
  }
}

export async function signUpWithPassword(
  name: string,
  email: string,
  password: string
): Promise<Result> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return { error: "Authentication is not configured." };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message };
    // Supabase sends its own confirmation email; surface the same state.
    return { data: { needsVerification: true, email } };
  }
  return apiJson("/api/auth/signup", { name, email, password });
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<Result> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return { error: "Authentication is not configured." };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return {};
  }
  return apiJson("/api/auth/login", { email, password });
}

/** Resend the email-verification link (local provider). */
export async function resendVerification(email: string): Promise<Result> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return { error: "Authentication is not configured." };
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) return { error: error.message };
    return {};
  }
  return apiJson("/api/auth/resend-verification", { email });
}

/**
 * Supabase Google OAuth (redirect flow). Used only when Supabase is configured;
 * the local provider uses Google Identity Services + `signInWithGoogleCredential`.
 */
export async function signInWithGoogle(): Promise<Result> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID, or continue with email.",
    };
  }
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { error: "Authentication is not configured." };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  return {};
}

/** Local provider: exchange a Google Identity Services ID token for a session. */
export async function signInWithGoogleCredential(credential: string): Promise<Result> {
  return apiJson("/api/auth/google", { credential });
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
  }
  // Always hit the server route to clear cookies in both modes.
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
}
