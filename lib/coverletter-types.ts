import type { CVData } from "@/lib/cv-types";

export type CoverLetterTemplateId = "classic" | "modern";

export const COVER_LETTER_TEMPLATES: {
  id: CoverLetterTemplateId;
  label: string;
  note: string;
}[] = [
  { id: "classic", label: "Classic", note: "Traditional, serif, formal" },
  { id: "modern", label: "Modern", note: "Clean sans-serif with a subtle accent" },
];

/** Editable letter body + a snapshot of the sender's contact details. */
export interface CoverLetterContent {
  date: string;
  subject: string;
  greeting: string;
  opening: string;
  /** Body paragraphs separated by blank lines. */
  body: string;
  closing: string;
  signature: string;
  // Sender snapshot (taken from the selected CV, editable).
  senderName: string;
  senderTitle: string;
  senderEmail: string;
  senderPhone: string;
  senderLocation: string;
}

export interface CoverLetterData {
  template: CoverLetterTemplateId;
  companyName: string;
  jobTitle: string;
  hiringManager: string;
  companyLocation: string;
  jobDescription: string;
  content: CoverLetterContent;
}

export function emptyCoverLetterContent(): CoverLetterContent {
  return {
    date: "",
    subject: "",
    greeting: "",
    opening: "",
    body: "",
    closing: "",
    signature: "",
    senderName: "",
    senderTitle: "",
    senderEmail: "",
    senderPhone: "",
    senderLocation: "",
  };
}

export function todayLong(now = new Date()): string {
  try {
    return now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Build sensible STARTER content from the applicant's real CV plus the job
 * details. This is a structured template with the user's known information
 * filled in — not AI-personalised prose. The user edits everything.
 */
export function buildStarterContent(
  cv: CVData | null,
  meta: {
    companyName: string;
    jobTitle: string;
    hiringManager: string;
    companyLocation: string;
  },
  date: string
): CoverLetterContent {
  const p = cv?.personal;
  const name = p?.fullName?.trim() || "Your Name";
  const role = p?.title?.trim() || "professional";
  const company = meta.companyName.trim() || "[Company]";
  const job = meta.jobTitle.trim() || "[Job Title]";
  const manager = meta.hiringManager.trim();

  const topSkills = (cv?.skills ?? [])
    .map((s) => s.name)
    .filter(Boolean)
    .slice(0, 3);
  const skillLine = topSkills.length
    ? `My background has given me hands-on experience with ${listToSentence(
        topSkills
      )}, and I am confident I can bring that same focus to your team.`
    : "I am confident that my background and skills make me a strong fit for this role.";

  const latestRole = cv?.experiences?.[0];
  const experienceLine = latestRole?.position
    ? `In my most recent role as ${latestRole.position}${
        latestRole.company ? ` at ${latestRole.company}` : ""
      }, I developed skills that align closely with what this position requires.`
    : "Through my studies and experience, I have developed skills that align closely with what this position requires.";

  return {
    date,
    subject: `Application for ${job}`,
    greeting: manager ? `Dear ${manager},` : "Dear Hiring Manager,",
    opening: `I am writing to apply for the ${job} position at ${company}. As a ${role}, I was excited to see this opportunity and believe my experience makes me a strong candidate.`,
    body: `${experienceLine} ${skillLine}\n\nI am drawn to ${company} because of the quality of its work and the chance to contribute to meaningful projects. I would welcome the opportunity to bring my experience, curiosity and commitment to your team.`,
    closing: `Thank you for taking the time to consider my application. I would be glad to discuss how I can contribute to ${company}, and I look forward to hearing from you.`,
    signature: name,
    senderName: name,
    senderTitle: p?.title?.trim() || "",
    senderEmail: p?.email?.trim() || "",
    senderPhone: p?.phone?.trim() || "",
    senderLocation: p?.location?.trim() || "",
  };
}

function listToSentence(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
