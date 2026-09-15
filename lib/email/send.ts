import "server-only";

/**
 * Minimal, dependency-free email delivery for the built-in (local) auth
 * provider.
 *
 * Delivery strategy — free, no paid API/service:
 *   1. If SMTP is configured (SMTP_URL, or SMTP_HOST/PORT/USER/PASS) AND the
 *      optional `nodemailer` package is installed, send over SMTP. nodemailer
 *      is imported dynamically so it remains an OPTIONAL dependency — the app
 *      works without it.
 *   2. Otherwise fall back to "console" delivery: the message (including any
 *      verification link) is logged to the server console so the whole flow is
 *      fully usable in local development without any external service.
 *
 * In production you either configure SMTP here or run in Supabase mode, where
 * Supabase sends the verification email for free.
 */
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface MailResult {
  delivered: boolean; // true only when actually handed to an SMTP server
  transport: "smtp" | "console";
}

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_URL || process.env.SMTP_HOST);
}

/**
 * Load the OPTIONAL `nodemailer` package at runtime without the bundler trying
 * to resolve it at build time (so the app builds and runs whether or not it is
 * installed). Returns null if it isn't available.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadNodemailer(): any | null {
  try {
    // eslint-disable-next-line no-eval
    const req = eval("require") as NodeRequire;
    return req("nodemailer");
  } catch {
    return null;
  }
}

function mailFrom(): string {
  return process.env.MAIL_FROM || "CVForge <no-reply@cvforge.local>";
}

export async function sendEmail(msg: MailMessage): Promise<MailResult> {
  if (smtpConfigured()) {
    try {
      // Optional dependency — only required if a deployment opts into SMTP.
      const nodemailer = loadNodemailer();
      if (!nodemailer) throw new Error("nodemailer is not installed");
      const transporter = process.env.SMTP_URL
        ? nodemailer.createTransport(process.env.SMTP_URL)
        : nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: process.env.SMTP_USER
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              : undefined,
          });
      await transporter.sendMail({
        from: mailFrom(),
        to: msg.to,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
      });
      return { delivered: true, transport: "smtp" };
    } catch (err) {
      // Never let email delivery break the request — degrade to console.
      console.error("[email] SMTP delivery failed; falling back to console:", err);
    }
  }

  console.log(
    `\n──────── [email:dev] ────────\n` +
      `To:      ${msg.to}\n` +
      `Subject: ${msg.subject}\n\n` +
      `${msg.text}\n` +
      `─────────────────────────────\n`
  );
  return { delivered: false, transport: "console" };
}
