import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/**
 * OAuth / email-confirmation callback for Supabase.
 * Exchanges the auth code for a session, ensures the user's Profile row exists
 * (created on first login, never duplicated), then redirects to the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("OAuth callback exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Idempotently create/update the Profile for this Supabase user.
  await getAuthUser();

  return NextResponse.redirect(`${origin}${next}`);
}
