import { NextResponse } from "next/server";
import { clearLocalSession } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseEnabled } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (supabaseEnabled()) {
      const supabase = createSupabaseServerClient();
      if (supabase) await supabase.auth.signOut();
    } else {
      clearLocalSession();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/logout failed:", err);
    // Even on error, clear local session so the user isn't stuck signed in.
    clearLocalSession();
    return NextResponse.json({ ok: true });
  }
}
