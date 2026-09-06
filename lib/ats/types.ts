/**
 * Types for the CVForge ATS analyzer. The analyzer is fully deterministic and
 * rule-based — it uses no AI API. Scores are an *estimate* of how well a CV is
 * likely to read to automated Applicant Tracking Systems and recruiters; they
 * never guarantee real ATS compatibility.
 */

export type AtsMode = "CV" | "JOB";

/** A single scored dimension that contributes to the overall match score. */
export interface AtsSubScore {
  key: string;
  label: string;
  /** 0–100 for this dimension. */
  score: number;
  /** Relative weight in the overall score. */
  weight: number;
  detail: string;
}

export interface RelevantExperience {
  position: string;
  company: string;
  matchedTerms: string[];
}

/** The full deterministic analysis result. Safe to persist as JSON. */
export interface AtsResult {
  mode: AtsMode;
  /** CVForge Match Score, 0–100. An estimate — never a guarantee. */
  score: number;
  breakdown: AtsSubScore[];
  strengths: string[];
  weaknesses: string[];
  presentSections: string[];
  missingSections: string[];
  /** Recommended keywords the CV is missing (role- or job-derived). */
  missingKeywords: string[];
  /** Keywords found in the CV (job mode: shared with the job description). */
  matchingKeywords: string[];
  /** Skills shared between the CV and the job description (job mode). */
  matchingSkills: string[];
  /** Skills the job description asks for that the CV is missing (job mode). */
  missingSkills: string[];
  relevantExperience: RelevantExperience[];
  recommendations: string[];
  jobTitle?: string;
  /** Human-readable, honest disclaimer shown with every result. */
  disclaimer: string;
}
