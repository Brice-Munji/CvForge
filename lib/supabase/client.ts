import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 *
 * Sprint 1: authentication is stubbed at the UI/flow level so the product is
 * fully navigable without live credentials. This client is wired and ready to
 * take over real auth in Sprint 2 once environment variables are provided.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
