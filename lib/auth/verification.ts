import "server-only";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { buildVerificationEmail } from "@/lib/email/messages";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const TYPE = "EMAIL_VERIFY";

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Resolve the app's public origin for building absolute links. Prefers the
 * incoming request origin (correct behind any host/proxy), falling back to
 * APP_URL and finally localhost for local dev.
 */
export function resolveOrigin(req: Request): string {
  try {
    const h = req.headers;
    const forwardedHost = h.get("x-forwarded-host") || h.get("host");
    const proto =
      h.get("x-forwarded-proto") ||
      (forwardedHost && forwardedHost.startsWith("localhost") ? "http" : "https");
    if (forwardedHost) return `${proto}://${forwardedHost}`;
  } catch {
    /* ignore */
  }
  return process.env.APP_URL || "http://localhost:3000";
}

/**
 * Create a fresh single-use verification token for a user (invalidating any
 * previous ones) and return the raw token to embed in a link. Only the hash is
 * persisted.
 */
export async function createVerificationToken(userId: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { userId, type: TYPE } });
  await prisma.verificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      type: TYPE,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return raw;
}

/**
 * Generate a token, build the verification link, and send the email. Returns
 * the link (useful for logging / dev delivery). Never throws on delivery
 * failure — email is best-effort and always logged.
 */
export async function sendVerificationEmail(
  user: { id: string; email: string; name: string | null },
  origin: string
): Promise<{ link: string }> {
  const raw = await createVerificationToken(user.id);
  const link = `${origin}/api/auth/verify?token=${raw}`;
  const message = buildVerificationEmail({ to: user.email, name: user.name, link });
  await sendEmail(message);
  return { link };
}

/**
 * Consume a raw verification token: if valid and unexpired, mark the owning
 * profile verified, delete the user's tokens, and return the user id. Returns
 * null for missing/expired/unknown tokens.
 */
export async function consumeVerificationToken(
  raw: string | null | undefined
): Promise<string | null> {
  if (!raw || typeof raw !== "string") return null;
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(raw) },
  });
  if (!record || record.type !== TYPE) return null;
  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { id: record.id } }).catch(() => {});
    return null;
  }
  await prisma.profile.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { userId: record.userId, type: TYPE } });
  return record.userId;
}
