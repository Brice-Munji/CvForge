/**
 * Deterministic, rule-based ATS analyzer. NO AI API is used — every result is
 * a pure function of the input, so the same CV always produces the same score.
 *
 * Two entry points:
 *   - analyzeCv(cv)                → general "Check My CV" analysis
 *   - matchJob(cv, jobTitle, jd)   → "Match My CV to a Job" analysis
 *
 * The scores are an ESTIMATE and are always shipped with a disclaimer.
 */

import type { CVData } from "@/lib/cv-types";
import type {
  AtsResult,
  AtsSubScore,
  RelevantExperience,
} from "./types";

/**
 * Honest, human-readable disclaimer attached to every result. Kept here (the
 * single value module) so the analyzer has no runtime dependency on other
 * modules — which keeps it trivially unit-testable in isolation.
 */
export const ATS_DISCLAIMER =
  "This CVForge Match Score is a rule-based estimate to help you improve your CV. " +
  "It does not guarantee compatibility with any specific Applicant Tracking System.";

/* ------------------------------------------------------------------ */
/* Language data                                                       */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "the","and","for","are","but","not","you","your","with","this","that","have",
  "has","had","was","were","will","would","should","could","from","they","them",
  "their","our","its","it's","a","an","of","to","in","on","at","by","as","is",
  "be","or","if","we","us","i","he","she","his","her","who","whom","which","what",
  "when","where","why","how","all","any","can","may","must","shall","into","over",
  "then","than","so","such","up","out","off","per","via","within","across","about",
  "role","job","work","working","team","teams","years","year","experience","strong",
  "ability","able","including","etc","using","use","used","new","help","helping",
  "looking","seeking","join","candidate","candidates","ideal","plus","well","good",
  "great","excellent","required","requirements","responsibilities","responsible",
  "preferred","must-have","nice","day","daily","company","companies","business",
  "you'll","we're","you're","also","one","two","three","more","most","many","own",
]);

/**
 * Known skills / technologies / competencies. Lowercased. Multiword phrases are
 * matched against the raw corpus; single tokens against the token set.
 */
const SKILLS: string[] = [
  // Programming / web
  "javascript","typescript","python","java","c++","c#","php","ruby","go","rust",
  "kotlin","swift","scala","perl","html","css","sass","tailwind","react","angular",
  "vue","svelte","next.js","nextjs","node.js","nodejs","express","django","flask",
  "spring","laravel","rails",".net","graphql","rest","api","redux","jquery",
  // Data / cloud / devops
  "sql","mysql","postgresql","postgres","mongodb","redis","sqlite","oracle",
  "elasticsearch","aws","azure","gcp","google cloud","docker","kubernetes",
  "terraform","jenkins","ci/cd","git","github","gitlab","linux","bash","nginx",
  "kafka","rabbitmq","spark","hadoop","airflow","snowflake","tableau","power bi",
  "excel","spreadsheets","data analysis","data visualization","machine learning",
  "deep learning","nlp","pandas","numpy","pytorch","tensorflow","statistics",
  // Design
  "figma","sketch","adobe xd","photoshop","illustrator","indesign","ux","ui",
  "wireframing","prototyping","user research","design systems",
  // Marketing / sales / business
  "seo","sem","google analytics","content marketing","email marketing",
  "social media","copywriting","salesforce","hubspot","crm","lead generation",
  "market research","brand","campaign","ppc","conversion","b2b","b2c",
  // General professional
  "project management","product management","agile","scrum","kanban","jira",
  "stakeholder management","leadership","communication","teamwork","collaboration",
  "problem solving","time management","budgeting","forecasting","reporting",
  "customer service","negotiation","presentation","research","analytics",
  "accounting","bookkeeping","payroll","auditing","compliance","recruiting",
  "onboarding","training","mentoring","documentation","quality assurance",
  "testing","troubleshooting","operations","logistics","procurement","planning",
];

const SKILL_SET = new Set(SKILLS);

const ACTION_VERBS = new Set([
  "led","built","created","designed","developed","managed","launched","improved",
  "increased","reduced","delivered","implemented","optimized","achieved","drove",
  "owned","shipped","grew","scaled","automated","streamlined","coordinated",
  "spearheaded","initiated","established","migrated","architected","mentored",
  "analyzed","negotiated","secured","generated","boosted","cut","saved","won",
]);

/** Role keyword profiles for the general (no job description) analysis. */
const ROLE_PROFILES: { match: RegExp; keywords: string[] }[] = [
  {
    match: /(software|developer|engineer|programmer|full[- ]?stack|backend|frontend|web)/,
    keywords: ["git","api","testing","agile","ci/cd","code review","debugging",
      "databases","rest","cloud"],
  },
  {
    match: /(data|analyst|scientist|machine learning|ml|ai\b)/,
    keywords: ["sql","python","data analysis","statistics","visualization",
      "dashboards","excel","reporting","machine learning","modeling"],
  },
  {
    match: /(design|ux|ui|product design|graphic)/,
    keywords: ["figma","prototyping","wireframing","user research","design systems",
      "typography","accessibility","usability"],
  },
  {
    match: /(market|seo|content|brand|growth|social media)/,
    keywords: ["seo","analytics","content marketing","campaign","social media",
      "copywriting","email marketing","conversion","branding"],
  },
  {
    match: /(sales|account executive|business development|bdr|sdr)/,
    keywords: ["crm","lead generation","pipeline","negotiation","forecasting",
      "prospecting","closing","quota","salesforce"],
  },
  {
    match: /(manager|management|lead|director|head of|supervisor)/,
    keywords: ["leadership","stakeholder management","budgeting","strategy",
      "hiring","mentoring","kpis","reporting","planning"],
  },
  {
    match: /(account|finance|financial|bookkeep|audit)/,
    keywords: ["accounting","reporting","budgeting","forecasting","reconciliation",
      "compliance","excel","auditing"],
  },
  {
    match: /(nurse|clinical|medical|health)/,
    keywords: ["patient care","documentation","compliance","assessment","treatment",
      "communication","teamwork"],
  },
  {
    match: /(teacher|tutor|education|instructor|lecturer)/,
    keywords: ["curriculum","lesson planning","assessment","classroom management",
      "communication","mentoring"],
  },
  {
    match: /(customer|support|success|service)/,
    keywords: ["customer service","crm","communication","troubleshooting",
      "onboarding","problem solving","ticketing"],
  },
];

const GENERIC_KEYWORDS = [
  "communication","teamwork","problem solving","leadership","project management",
  "time management","reporting","collaboration","analytics",
];

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

function lc(s: unknown): string {
  return typeof s === "string" ? s.toLowerCase() : "";
}

/** Tokenize into meaningful words. Keeps chars used by tech terms (+ # . /). */
export function tokenize(text: string): string[] {
  return lc(text)
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .split(/[\s-]+/)
    .map((t) => t.replace(/^[.\/]+|[.\/]+$/g, ""))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

function countBy(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

/** Detect known multi/single-word skills present in a raw corpus. */
export function detectSkills(corpus: string): string[] {
  const c = ` ${lc(corpus)} `;
  const tokenSet = new Set(tokenize(corpus));
  const found: string[] = [];
  for (const skill of SKILLS) {
    const hit = skill.includes(" ")
      ? c.includes(` ${skill} `) || c.includes(`${skill}`)
      : tokenSet.has(skill);
    if (hit) found.push(skill);
  }
  return Array.from(new Set(found));
}

/** Top keywords from arbitrary text (used on job descriptions). */
export function extractKeywords(text: string, limit = 25): string[] {
  const corpus = lc(text);
  const counts = countBy(tokenize(text));

  // Multiword skills present get a strong boost so phrases surface as keywords.
  for (const skill of SKILLS) {
    if (skill.includes(" ") && corpus.includes(skill)) {
      counts.set(skill, (counts.get(skill) ?? 0) + 3);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([k]) => k);
}

/* ------------------------------------------------------------------ */
/* CV corpus                                                           */
/* ------------------------------------------------------------------ */

function experienceText(cv: CVData): string {
  return cv.experiences
    .map((e) => `${e.position} ${e.company} ${e.description}`)
    .join(" ");
}

/** Full searchable text of the CV. */
export function cvCorpus(cv: CVData): string {
  const parts: string[] = [];
  const p = cv.personal;
  parts.push(p.fullName, p.title, p.location);
  parts.push(cv.summary);
  parts.push(experienceText(cv));
  parts.push(cv.educations.map((e) => `${e.degree} ${e.field} ${e.institution} ${e.description}`).join(" "));
  parts.push(cv.skills.map((s) => s.name).join(" "));
  parts.push(cv.projects.map((pr) => `${pr.name} ${pr.description} ${pr.technologies.join(" ")}`).join(" "));
  parts.push(cv.certifications.map((c) => `${c.name} ${c.issuer}`).join(" "));
  return parts.join(" ").trim();
}

/* ------------------------------------------------------------------ */
/* Structure scoring (shared by both modes)                            */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StructureAnalysis {
  subScores: AtsSubScore[];
  strengths: string[];
  weaknesses: string[];
  presentSections: string[];
  missingSections: string[];
  recommendations: string[];
}

function has(s: string | undefined | null): boolean {
  return typeof s === "string" && s.trim().length > 0;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function analyzeStructure(cv: CVData): StructureAnalysis {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const present: string[] = [];
  const missing: string[] = [];
  const p = cv.personal;

  /* --- Contact information --- */
  let contact = 0;
  const emailOk = has(p.email) && EMAIL_RE.test(p.email.trim());
  if (has(p.fullName)) contact += 25;
  if (emailOk) contact += 30;
  else if (has(p.email)) contact += 10;
  if (has(p.phone)) contact += 20;
  if (has(p.location)) contact += 15;
  if (has(p.linkedin) || has(p.portfolio)) contact += 10;
  contact = clamp(contact);
  if (emailOk && has(p.phone)) strengths.push("Clear contact details (email and phone).");
  if (!has(p.fullName)) { weaknesses.push("No name in the contact section."); recommendations.push("Add your full name to the contact header."); }
  if (!emailOk) { weaknesses.push("Missing or invalid email address."); recommendations.push("Add a valid professional email address."); }
  if (!has(p.phone)) recommendations.push("Add a phone number so recruiters can reach you.");
  if (has(p.email) || has(p.phone) || has(p.fullName)) present.push("Contact information");
  else missing.push("Contact information");

  /* --- Required sections --- */
  const hasSummary = has(cv.summary);
  const hasExp = cv.experiences.some((e) => has(e.position) || has(e.company));
  const hasEdu = cv.educations.some((e) => has(e.institution) || has(e.degree));
  const hasSkills = cv.skills.some((s) => has(s.name));

  if (hasSummary) present.push("Professional summary");
  else { missing.push("Professional summary"); recommendations.push("Add a short professional summary (2–3 sentences)."); }
  if (hasExp) present.push("Work experience");
  else { missing.push("Work experience"); recommendations.push("Add your work experience with roles and dates."); }
  if (hasEdu) present.push("Education");
  else { missing.push("Education"); recommendations.push("Add your education history."); }
  if (hasSkills) present.push("Skills");
  else { missing.push("Skills"); recommendations.push("Add a skills section listing relevant tools and competencies."); }

  const sectionsScore = clamp(
    (hasSummary ? 25 : 0) + (hasExp ? 35 : 0) + (hasEdu ? 20 : 0) + (hasSkills ? 20 : 0)
  );
  if (hasExp && hasEdu && hasSkills && hasSummary) strengths.push("All core CV sections are present.");

  /* --- Work experience quality --- */
  const exps = cv.experiences.filter((e) => has(e.position) || has(e.company));
  let expScore = 0;
  if (exps.length) {
    const withDesc = exps.filter((e) => has(e.description));
    const withDates = exps.filter((e) => has(e.startDate));
    const corpus = lc(experienceText(cv));
    const quantified = /\b\d+([.,]\d+)?\s?(%|percent|k\b|m\b|\$|users|customers|hours|months|clients|projects|people|x\b)/.test(corpus) || /\$\s?\d/.test(corpus) || /\b\d{2,}\b/.test(corpus);
    const usesVerbs = Array.from(ACTION_VERBS).some((v) => corpus.includes(v));
    expScore += Math.min(exps.length, 3) * 12; // up to 36
    expScore += (withDesc.length / exps.length) * 30;
    expScore += (withDates.length / exps.length) * 14;
    expScore += quantified ? 12 : 0;
    expScore += usesVerbs ? 8 : 0;
    expScore = clamp(expScore);
    if (quantified) strengths.push("Work experience includes measurable results.");
    else { weaknesses.push("Work experience lacks measurable achievements."); recommendations.push("Quantify achievements with numbers (e.g. \"increased sales by 20%\")."); }
    if (!usesVerbs) recommendations.push("Start experience bullet points with strong action verbs (led, built, improved).");
    if (withDesc.length < exps.length) recommendations.push("Add a description to every role explaining what you did and achieved.");
  } else {
    weaknesses.push("No work experience listed.");
  }

  /* --- Skills depth --- */
  const skillCount = cv.skills.filter((s) => has(s.name)).length;
  const skillsScore = clamp(skillCount === 0 ? 0 : 30 + Math.min(skillCount, 10) * 7);
  if (skillCount >= 6) strengths.push("A solid range of skills is listed.");
  else if (skillCount > 0) recommendations.push("List at least 6–10 relevant skills for stronger keyword coverage.");

  /* --- Education --- */
  const eduRows = cv.educations.filter((e) => has(e.institution) || has(e.degree));
  let eduScore = 0;
  if (eduRows.length) {
    eduScore = 55;
    if (eduRows.some((e) => has(e.degree) && has(e.field))) eduScore += 25;
    if (eduRows.some((e) => has(e.startDate) || has(e.endDate))) eduScore += 20;
    eduScore = clamp(eduScore);
  } else {
    recommendations.push("Add your highest qualification to the education section.");
  }

  /* --- Formatting / readability --- */
  let fmt = 60;
  const summaryLen = cv.summary.trim().length;
  if (hasSummary && summaryLen >= 120 && summaryLen <= 600) { fmt += 20; strengths.push("The summary is a good, readable length."); }
  else if (hasSummary && summaryLen > 900) { fmt -= 10; recommendations.push("Shorten the professional summary — keep it concise (2–3 sentences)."); }
  const longDesc = exps.find((e) => e.description.trim().length > 1200);
  if (longDesc) { fmt -= 10; recommendations.push("Break long experience descriptions into short, scannable bullet points."); }
  if (exps.every((e) => has(e.startDate)) && exps.length) fmt += 20;
  else if (exps.length) recommendations.push("Add start and end dates to each role — ATS software parses them.");
  fmt = clamp(fmt);

  const subScores: AtsSubScore[] = [
    { key: "contact", label: "Contact information", score: contact, weight: 10, detail: emailOk ? "Reachable contact details found." : "Contact details are incomplete." },
    { key: "sections", label: "Required sections", score: sectionsScore, weight: 18, detail: missing.length ? `Missing: ${missing.join(", ")}.` : "All core sections present." },
    { key: "experience", label: "Work experience", score: expScore, weight: 22, detail: exps.length ? `${exps.length} role(s) analyzed.` : "No experience found." },
    { key: "skills", label: "Skills", score: skillsScore, weight: 15, detail: `${skillCount} skill(s) listed.` },
    { key: "education", label: "Education", score: eduScore, weight: 10, detail: eduRows.length ? "Education present." : "No education listed." },
    { key: "formatting", label: "Formatting & readability", score: fmt, weight: 10, detail: "Based on length, dates and structure." },
  ];

  return { subScores, strengths, weaknesses, presentSections: present, missingSections: missing, recommendations };
}

function weightedScore(subs: AtsSubScore[]): number {
  const totalWeight = subs.reduce((s, x) => s + x.weight, 0);
  if (totalWeight === 0) return 0;
  const sum = subs.reduce((s, x) => s + x.score * x.weight, 0);
  return clamp(sum / totalWeight);
}

function dedupe(list: string[]): string[] {
  return Array.from(new Set(list.map((s) => s.trim()).filter(Boolean)));
}

/* ------------------------------------------------------------------ */
/* Public: general CV analysis                                         */
/* ------------------------------------------------------------------ */

export function analyzeCv(cv: CVData): AtsResult {
  const s = analyzeStructure(cv);
  const corpus = cvCorpus(cv);
  const cvSkills = detectSkills(corpus);
  const tokenSet = new Set(tokenize(corpus));

  // Role-relevant keyword coverage based on the CV's own target title.
  const title = lc(cv.personal.title);
  const profile = ROLE_PROFILES.find((r) => r.match.test(title));
  const roleKeywords = profile ? profile.keywords : GENERIC_KEYWORDS;

  const present: string[] = [];
  const missingKeywords: string[] = [];
  for (const kw of roleKeywords) {
    const found = kw.includes(" ") ? lc(corpus).includes(kw) : tokenSet.has(kw);
    if (found) present.push(kw);
    else missingKeywords.push(kw);
  }
  const coverage = roleKeywords.length
    ? (present.length / roleKeywords.length) * 100
    : 50;
  const keywordScore = clamp(coverage);

  const subScores: AtsSubScore[] = [
    ...s.subScores,
    {
      key: "keywords",
      label: "Keyword relevance",
      score: keywordScore,
      weight: 15,
      detail: profile
        ? `Matched ${present.length}/${roleKeywords.length} keywords for your target role.`
        : "Add a job title to get role-specific keyword suggestions.",
    },
  ];

  const strengths = dedupe(s.strengths);
  if (cvSkills.length >= 6) strengths.push("Recognizable industry skills and tools are present.");

  const recommendations = dedupe(s.recommendations);
  if (missingKeywords.length) {
    recommendations.unshift(
      `Consider adding relevant keywords where truthful: ${missingKeywords.slice(0, 6).join(", ")}.`
    );
  }
  if (!has(cv.personal.title)) {
    recommendations.push("Add a target job title so your CV can be matched to roles.");
  }

  return {
    mode: "CV",
    score: weightedScore(subScores),
    breakdown: subScores,
    strengths,
    weaknesses: dedupe(s.weaknesses),
    presentSections: s.presentSections,
    missingSections: s.missingSections,
    missingKeywords: dedupe(missingKeywords).slice(0, 12),
    matchingKeywords: dedupe(present),
    matchingSkills: cvSkills.slice(0, 20),
    missingSkills: [],
    relevantExperience: [],
    recommendations,
    jobTitle: cv.personal.title || undefined,
    disclaimer: ATS_DISCLAIMER,
  };
}

/* ------------------------------------------------------------------ */
/* Public: job-description matching                                    */
/* ------------------------------------------------------------------ */

export function matchJob(
  cv: CVData,
  jobTitle: string,
  jobDescription: string
): AtsResult {
  const s = analyzeStructure(cv);
  const corpus = cvCorpus(cv);
  const cvCorpusLc = lc(corpus);
  const cvTokens = new Set(tokenize(corpus));
  const cvSkills = new Set(detectSkills(corpus));

  const jdText = `${jobTitle} ${jobDescription}`.trim();
  const jdKeywords = extractKeywords(jdText, 30);
  const jdSkills = detectSkills(jdText);

  // Keyword coverage.
  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];
  for (const kw of jdKeywords) {
    const found = kw.includes(" ") ? cvCorpusLc.includes(kw) : cvTokens.has(kw);
    if (found) matchingKeywords.push(kw);
    else missingKeywords.push(kw);
  }
  const keywordCoverage = jdKeywords.length
    ? (matchingKeywords.length / jdKeywords.length) * 100
    : 0;

  // Skill coverage.
  const matchingSkills = jdSkills.filter((sk) => cvSkills.has(sk));
  const missingSkills = jdSkills.filter((sk) => !cvSkills.has(sk));
  const skillCoverage = jdSkills.length
    ? (matchingSkills.length / jdSkills.length) * 100
    : keywordCoverage;

  // Title relevance.
  const titleTokens = tokenize(jobTitle);
  const titleMatched = titleTokens.filter((t) => cvTokens.has(t));
  const titleCoverage = titleTokens.length
    ? (titleMatched.length / titleTokens.length) * 100
    : 50;

  // Relevant experience: roles that overlap the job's keywords/skills.
  const targetTerms = new Set([...jdKeywords, ...jdSkills.map((x) => x)]);
  const relevantExperience: RelevantExperience[] = [];
  for (const e of cv.experiences) {
    if (!has(e.position) && !has(e.company)) continue;
    const text = lc(`${e.position} ${e.company} ${e.description}`);
    const eTokens = new Set(tokenize(text));
    const matched: string[] = [];
    for (const term of targetTerms) {
      const found = term.includes(" ") ? text.includes(term) : eTokens.has(term);
      if (found) matched.push(term);
    }
    if (matched.length) {
      relevantExperience.push({
        position: e.position || "(untitled role)",
        company: e.company,
        matchedTerms: Array.from(new Set(matched)).slice(0, 8),
      });
    }
  }
  relevantExperience.sort((a, b) => b.matchedTerms.length - a.matchedTerms.length);

  const matchSubScores: AtsSubScore[] = [
    { key: "keyword_match", label: "Keyword match", score: clamp(keywordCoverage), weight: 40, detail: `${matchingKeywords.length}/${jdKeywords.length} job keywords found in your CV.` },
    { key: "skill_match", label: "Skill match", score: clamp(skillCoverage), weight: 25, detail: jdSkills.length ? `${matchingSkills.length}/${jdSkills.length} required skills matched.` : "No specific skills detected in the job description." },
    { key: "title_match", label: "Job title relevance", score: clamp(titleCoverage), weight: 10, detail: titleMatched.length ? "Your CV references this kind of role." : "Your CV doesn't mention this job title." },
    // Structure still matters for a job application.
    { key: "experience", label: "Work experience", score: (s.subScores.find((x) => x.key === "experience")?.score) ?? 0, weight: 15, detail: relevantExperience.length ? `${relevantExperience.length} relevant role(s).` : "No clearly relevant experience found." },
    { key: "sections", label: "CV completeness", score: (s.subScores.find((x) => x.key === "sections")?.score) ?? 0, weight: 10, detail: s.missingSections.length ? `Missing: ${s.missingSections.join(", ")}.` : "All core sections present." },
  ];

  const strengths = dedupe(s.strengths);
  if (matchingSkills.length) strengths.unshift(`Your CV matches key skills: ${matchingSkills.slice(0, 6).join(", ")}.`);
  if (keywordCoverage >= 60) strengths.unshift("Strong keyword overlap with this job description.");
  if (relevantExperience.length) strengths.push("You have experience relevant to this role.");

  const weaknesses = dedupe(s.weaknesses);
  if (keywordCoverage < 50) weaknesses.unshift("Low keyword overlap with this job description.");
  if (missingSkills.length) weaknesses.push(`Missing skills the job asks for: ${missingSkills.slice(0, 6).join(", ")}.`);

  const recommendations = dedupe(s.recommendations);
  if (missingKeywords.length) {
    recommendations.unshift(
      `Where truthful, work these job keywords into your CV: ${missingKeywords.slice(0, 8).join(", ")}.`
    );
  }
  if (missingSkills.length) {
    recommendations.unshift(
      `Add or highlight these skills if you have them: ${missingSkills.slice(0, 8).join(", ")}.`
    );
  }
  if (!titleMatched.length && has(jobTitle)) {
    recommendations.push(`Mirror the job title "${jobTitle}" in your summary or a recent role where accurate.`);
  }

  return {
    mode: "JOB",
    score: weightedScore(matchSubScores),
    breakdown: matchSubScores,
    strengths,
    weaknesses,
    presentSections: s.presentSections,
    missingSections: s.missingSections,
    missingKeywords: dedupe(missingKeywords).slice(0, 20),
    matchingKeywords: dedupe(matchingKeywords).slice(0, 30),
    matchingSkills: dedupe(matchingSkills),
    missingSkills: dedupe(missingSkills),
    relevantExperience: relevantExperience.slice(0, 6),
    recommendations,
    jobTitle: jobTitle || undefined,
    disclaimer: ATS_DISCLAIMER,
  };
}
