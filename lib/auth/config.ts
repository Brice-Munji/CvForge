/**
 * Auth configuration.
 *
 * CVForge supports two interchangeable authentication backends that both
 * resolve to a `Profile` row in the same Postgres database:
 *
 *  - **Supabase** (production): used when the Supabase env vars are present.
 *    Handles email/password, Google OAuth and session cookies.
 *  - **Local** (zero-config / self-hosted dev): used when Supabase is not
 *    configured. Real password hashing (scrypt) against the `Profile` table
 *    with a signed, HTTP-only session cookie. Never localStorage, never fake.
 *
 * This lets the project run with `npm install && npm run dev` out of the box,
 * and switch to Supabase simply by setting the env vars — no code changes.
 */
export function supabaseEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const SESSION_COOKIE = "cvforge_session";

export function sessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    // Dev fallback so the app never crashes without config. Set SESSION_SECRET
    // in any real deployment that uses the local auth provider.
    "cvforge-insecure-development-secret-please-override"
  );
}
