"use client";

/**
 * Sprint 1 lightweight client auth.
 *
 * Keeps the full sign up → dashboard → builder flow navigable without live
 * Supabase credentials. In Sprint 2 this module is replaced by the wired
 * Supabase clients in lib/supabase/*.
 */

export interface LocalUser {
  name: string;
  email: string;
}

const KEY = "cvforge:user";

export function getUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: LocalUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cvforge:auth"));
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cvforge:auth"));
}
