"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

type Result = { error?: string };

async function apiJson(path: string, body: unknown): Promise<Result> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || "Something went wrong. Please try again." };
    }
    return {};
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
    // With email confirmation disabled the session is active immediately.
    return {};
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

export async function signInWithGoogle(): Promise<Result> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Google sign-in requires Supabase. Add your Supabase keys to enable it, or continue with email.",
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

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
  }
  // Always hit the server route to clear cookies in both modes.
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
}
