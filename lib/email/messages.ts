import type { MailMessage } from "./send";

/** Build the "confirm your email" message sent after a local password sign-up. */
export function buildVerificationEmail(opts: {
  to: string;
  name?: string | null;
  link: string;
}): MailMessage {
  const greeting = opts.name?.trim() ? `Hi ${opts.name.trim()},` : "Hi,";
  const text = `${greeting}

Welcome to CVForge! Please confirm your email address to activate your account:

${opts.link}

This link expires in 24 hours. If you didn't create a CVForge account, you can safely ignore this email.

— The CVForge team`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f5f4f0;font-family:Arial,Helvetica,sans-serif;color:#262626;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:32px;">
          <tr><td style="font-size:20px;font-weight:bold;color:#111827;">CVForge</td></tr>
          <tr><td style="padding-top:16px;font-size:15px;line-height:1.6;">
            ${greeting}<br/><br/>
            Welcome to CVForge! Please confirm your email address to activate your account.
          </td></tr>
          <tr><td style="padding:24px 0;">
            <a href="${opts.link}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px;font-size:15px;">Verify my email</a>
          </td></tr>
          <tr><td style="font-size:13px;line-height:1.6;color:#6b7280;">
            Or paste this link into your browser:<br/>
            <a href="${opts.link}" style="color:#4f46e5;word-break:break-all;">${opts.link}</a><br/><br/>
            This link expires in 24 hours. If you didn't create a CVForge account, you can safely ignore this email.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { to: opts.to, subject: "Confirm your CVForge email address", text, html };
}
