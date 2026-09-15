import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, createSign } from "node:crypto";
import { verifyGoogleIdToken } from "./google-verify";

// A controlled RSA keypair standing in for Google's signing key.
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const KID = "test-key-1";
const AUD = "test-client-id.apps.googleusercontent.com";

const jwkPublic = { ...publicKey.export({ format: "jwk" }), kid: KID, alg: "RS256" };

const b64url = (buf: Buffer | string) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function makeToken(payloadOverrides: Record<string, unknown> = {}, kid = KID): string {
  const header = b64url(JSON.stringify({ alg: "RS256", kid, typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: "https://accounts.google.com",
      aud: AUD,
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: "1234567890",
      email: "user@gmail.com",
      email_verified: true,
      name: "Test User",
      picture: "https://example.com/a.png",
      ...payloadOverrides,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  const sig = b64url(signer.sign(privateKey));
  return `${header}.${payload}.${sig}`;
}

// Serve our public key as Google's JWKS.
const realFetch = globalThis.fetch;
function mockCerts() {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ keys: [jwkPublic] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

test("accepts a valid, correctly-signed Google token", async () => {
  process.env.GOOGLE_CLIENT_ID = AUD;
  mockCerts();
  const identity = await verifyGoogleIdToken(makeToken());
  assert.equal(identity.email, "user@gmail.com");
  assert.equal(identity.emailVerified, true);
  assert.equal(identity.sub, "1234567890");
  assert.equal(identity.name, "Test User");
});

test("rejects a token for a different audience (client id)", async () => {
  process.env.GOOGLE_CLIENT_ID = AUD;
  mockCerts();
  await assert.rejects(() => verifyGoogleIdToken(makeToken({ aud: "someone-else" })), /audience/);
});

test("rejects an expired token", async () => {
  process.env.GOOGLE_CLIENT_ID = AUD;
  mockCerts();
  await assert.rejects(
    () => verifyGoogleIdToken(makeToken({ exp: Math.floor(Date.now() / 1000) - 10 })),
    /expired/
  );
});

test("rejects an unverified Google email", async () => {
  process.env.GOOGLE_CLIENT_ID = AUD;
  mockCerts();
  await assert.rejects(() => verifyGoogleIdToken(makeToken({ email_verified: false })), /not verified/);
});

test("rejects a bad issuer", async () => {
  process.env.GOOGLE_CLIENT_ID = AUD;
  mockCerts();
  await assert.rejects(() => verifyGoogleIdToken(makeToken({ iss: "evil.example.com" })), /issuer/);
});

test("rejects a tampered payload (signature mismatch)", async () => {
  process.env.GOOGLE_CLIENT_ID = AUD;
  mockCerts();
  const token = makeToken();
  const [h, , s] = token.split(".");
  const forged = b64url(JSON.stringify({ iss: "https://accounts.google.com", aud: AUD, sub: "x", email: "attacker@gmail.com", email_verified: true, exp: Math.floor(Date.now() / 1000) + 3600 }));
  await assert.rejects(() => verifyGoogleIdToken(`${h}.${forged}.${s}`), /signature/);
});

test("rejects an unknown signing key id", async () => {
  process.env.GOOGLE_CLIENT_ID = AUD;
  mockCerts();
  await assert.rejects(() => verifyGoogleIdToken(makeToken({}, "unknown-kid")), /signing key/);
});

test("rejects when Google sign-in is not configured", async () => {
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  await assert.rejects(() => verifyGoogleIdToken(makeToken()), /not configured/);
});
