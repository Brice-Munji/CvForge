/**
 * Pure, dependency-free verification of a Google Identity Services ID token.
 *
 * Kept free of the `server-only` guard so it can be unit-tested directly; it is
 * only ever imported by server code (see google.ts). Verification is done
 * LOCALLY against Google's public signing keys (JWKS) — no paid service.
 */

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const VALID_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

export function googleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}

export function googleSignInConfigured(): boolean {
  return Boolean(googleClientId());
}

function b64urlToBytes(part: string): Uint8Array {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  return new Uint8Array(Buffer.from(b64 + pad, "base64"));
}

function b64urlToJson<T>(part: string): T {
  return JSON.parse(Buffer.from(b64urlToBytes(part)).toString("utf8")) as T;
}

interface Jwk {
  kid: string;
  n: string;
  e: string;
  alg?: string;
  kty: string;
}

async function fetchGoogleKeys(): Promise<Jwk[]> {
  const res = await fetch(GOOGLE_CERTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch Google certs: ${res.status}`);
  const data = (await res.json()) as { keys: Jwk[] };
  return data.keys || [];
}

/**
 * Verify a Google ID token and return the verified identity, or throw if the
 * token is invalid for any reason (bad signature, wrong audience/issuer,
 * expired, or unverified email).
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  const clientId = googleClientId();
  if (!clientId) throw new Error("Google sign-in is not configured.");
  if (!idToken || typeof idToken !== "string") throw new Error("Missing Google credential.");

  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Malformed Google credential.");
  const [headerPart, payloadPart, sigPart] = parts;

  const header = b64urlToJson<{ kid?: string; alg?: string }>(headerPart);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported token algorithm.");

  const keys = await fetchGoogleKeys();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("Unknown signing key.");

  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const enc = new TextEncoder();
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlToBytes(sigPart) as unknown as BufferSource,
    enc.encode(`${headerPart}.${payloadPart}`) as unknown as BufferSource
  );
  if (!valid) throw new Error("Invalid token signature.");

  const payload = b64urlToJson<{
    iss?: string;
    aud?: string;
    exp?: number;
    sub?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
    picture?: string;
  }>(payloadPart);

  if (!payload.iss || !VALID_ISSUERS.has(payload.iss)) throw new Error("Invalid token issuer.");
  if (payload.aud !== clientId) throw new Error("Token audience mismatch.");
  if (!payload.exp || payload.exp * 1000 < Date.now()) throw new Error("Token expired.");
  if (!payload.sub) throw new Error("Token missing subject.");
  if (!payload.email) throw new Error("Token missing email.");

  const emailVerified = payload.email_verified === true || payload.email_verified === "true";
  if (!emailVerified) throw new Error("Google email is not verified.");

  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified,
    name: payload.name ?? null,
    picture: payload.picture ?? null,
  };
}
