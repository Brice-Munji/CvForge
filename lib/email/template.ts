export interface EmailSeed {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  hiringManager?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  hasCoverLetter?: boolean;
}

/**
 * Build a professional application email from structured templates (no AI).
 * Known information is populated automatically; the user edits everything.
 */
export function generateApplicationEmail(seed: EmailSeed): {
  subject: string;
  content: string;
} {
  const name = seed.applicantName.trim() || "[Your Name]";
  const job = seed.jobTitle.trim() || "[Job Title]";
  const company = seed.companyName.trim() || "[Company]";
  const greeting = seed.hiringManager?.trim()
    ? `Dear ${seed.hiringManager.trim()},`
    : "Dear Hiring Manager,";

  const attachments = seed.hasCoverLetter
    ? "I have attached my CV and cover letter for your consideration."
    : "I have attached my CV for your consideration.";

  const signatureLines = [name, seed.applicantEmail?.trim(), seed.applicantPhone?.trim()]
    .filter(Boolean)
    .join("\n");

  const subject = `Application for ${job} — ${name}`;

  const content = `${greeting}

I am writing to apply for the ${job} position at ${company}. ${attachments}

I believe my experience and skills make me a strong fit for this role, and I am excited about the opportunity to contribute to your team. I would welcome the chance to discuss my application in more detail.

Thank you for your time and consideration. I look forward to hearing from you.

Kind regards,
${signatureLines}`;

  return { subject, content };
}
