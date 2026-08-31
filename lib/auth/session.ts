import { sessionSecret } from "./config";

/**
 * Stateless signed session tokens for the local auth provider.
 * Implemented with Web Crypto (HMAC-SHA256) so the same code runs in both the
 * Node.js runtime (route handlers, server components) and the Edge runtime
 * (middleware).
 *
 * Token format: base64url(payloadJSON).base64url(hmac)
 */

interface SessionPayload {
  uid: string;
  exp: number; // epoch ms
}

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(
  uid: string,
  ttlMs = THIRTY_DAYS
): Promise<string> {
  const payload: SessionPayload = { uid, exp: Date.now() + ttlMs };
  const enc = new TextEncoder();
  const payloadBytes = enc.encode(JSON.stringify(payload));
  const payloadPart = toBase64Url(payloadBytes);
  const key = await getKey();
  const sig = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(payloadPart) as unknown as BufferSource
    )
  );
  return `${payloadPart}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<string | null> {
  if (!token) return null;
  const [payloadPart, sigPart] = token.split(".");
  if (!payloadPart || !sigPart) return null;
  try {
    const enc = new TextEncoder();
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigPart) as unknown as BufferSource,
      enc.encode(payloadPart) as unknown as BufferSource
    );
    if (!valid) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadPart))
    ) as SessionPayload;
    if (!payload.uid || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload.uid;
  } catch {
    return null;
  }
}
