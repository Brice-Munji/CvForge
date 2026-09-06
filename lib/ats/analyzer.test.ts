import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeCv,
  matchJob,
  tokenize,
  detectSkills,
  extractKeywords,
} from "@/lib/ats/analyzer";
import { emptyCv, developerCv } from "@/tests/cv-fixtures";

function inRange(n: number) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100;
}

/* ---------------------------- text helpers ---------------------------- */

test("tokenize drops stopwords, numbers and short tokens", () => {
  const t = tokenize("The React developer built 3 APIs and tests");
  assert.ok(t.includes("react"));
  assert.ok(t.includes("apis"));
  assert.ok(!t.includes("the"));
  assert.ok(!t.includes("and"));
  assert.ok(!t.includes("3"));
});

test("detectSkills finds single and multi-word skills", () => {
  const skills = detectSkills("Experienced in React, project management and SQL");
  assert.ok(skills.includes("react"));
  assert.ok(skills.includes("sql"));
  assert.ok(skills.includes("project management"));
});

test("extractKeywords returns the most frequent meaningful terms", () => {
  const kws = extractKeywords(
    "We need a React developer. React skills required. React React.",
    10
  );
  assert.ok(kws.includes("react"));
});

/* ---------------------------- CV analysis ----------------------------- */

test("empty CV: does not throw, returns a valid low score", () => {
  const r = analyzeCv(emptyCv());
  assert.ok(inRange(r.score));
  assert.ok(r.score < 40, `expected low score, got ${r.score}`);
  assert.equal(r.mode, "CV");
  assert.ok(r.missingSections.includes("Work experience"));
  assert.ok(r.missingSections.includes("Skills"));
  assert.ok(r.weaknesses.length > 0);
  assert.ok(r.recommendations.length > 0);
  assert.ok(r.disclaimer.length > 0);
});

test("strong developer CV scores well and lists strengths", () => {
  const r = analyzeCv(developerCv());
  assert.ok(inRange(r.score));
  assert.ok(r.score >= 65, `expected strong score, got ${r.score}`);
  assert.ok(r.strengths.length > 0);
  assert.equal(r.missingSections.length, 0);
  assert.ok(r.matchingSkills.includes("react"));
});

test("score calculation is deterministic (same input → same output)", () => {
  const cv = developerCv();
  assert.equal(analyzeCv(cv).score, analyzeCv(cv).score);
  assert.deepEqual(analyzeCv(cv), analyzeCv(cv));
});

test("breakdown weights sum is positive and each sub-score is in range", () => {
  const r = analyzeCv(developerCv());
  const totalWeight = r.breakdown.reduce((s, b) => s + b.weight, 0);
  assert.ok(totalWeight > 0);
  for (const b of r.breakdown) assert.ok(inRange(b.score), `${b.key}=${b.score}`);
});

test("missing keywords are suggested for a recognised role", () => {
  const cv = developerCv();
  cv.skills = []; // strip skills so role keywords are missing
  cv.summary = "";
  cv.experiences = [];
  const r = analyzeCv(cv);
  assert.ok(r.missingKeywords.length > 0);
});

test("a stronger CV never scores lower than an empty one", () => {
  assert.ok(analyzeCv(developerCv()).score > analyzeCv(emptyCv()).score);
});

/* ---------------------------- Job matching ---------------------------- */

const JOB = `We are hiring a Frontend Developer. You will build user interfaces
with React and TypeScript. Experience with REST APIs, testing and Git is
required. Knowledge of Docker and AWS is a plus. Strong communication skills.`;

test("job matching returns matching and missing keywords/skills", () => {
  const r = matchJob(developerCv(), "Frontend Developer", JOB);
  assert.equal(r.mode, "JOB");
  assert.ok(inRange(r.score));
  assert.ok(r.matchingSkills.includes("react"));
  assert.ok(r.matchingSkills.includes("typescript"));
  // Docker / AWS are in the job but not the CV.
  assert.ok(
    r.missingSkills.includes("docker") || r.missingSkills.includes("aws"),
    `missingSkills=${r.missingSkills.join(",")}`
  );
  assert.ok(r.matchingKeywords.length > 0);
  assert.ok(r.relevantExperience.length > 0);
});

test("a well-matched CV scores higher than an unrelated one", () => {
  const good = matchJob(developerCv(), "Frontend Developer", JOB).score;

  const unrelated = developerCv();
  unrelated.personal.title = "Chef";
  unrelated.summary = "Experienced chef specialising in pastry and kitchen management.";
  unrelated.experiences = [
    {
      id: "x",
      position: "Head Chef",
      company: "Restaurant",
      location: "",
      startDate: "2019",
      endDate: "2023",
      current: false,
      description: "Managed kitchen staff, menu planning and food cost.",
    },
  ];
  unrelated.skills = [{ id: "s", name: "Cooking", level: "Expert" }];
  const bad = matchJob(unrelated, "Frontend Developer", JOB).score;

  assert.ok(good > bad, `expected ${good} > ${bad}`);
});

test("job matching tolerates an empty job description (invalid input) without throwing", () => {
  const r = matchJob(developerCv(), "", "");
  assert.ok(inRange(r.score));
  assert.equal(r.mode, "JOB");
});

test("whitespace-only fields are treated as empty (invalid/blank input)", () => {
  const cv = emptyCv();
  cv.personal.fullName = "   ";
  cv.summary = "   ";
  cv.experiences = [
    {
      id: "e",
      position: "   ",
      company: "  ",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "   ",
    },
  ];
  const r = analyzeCv(cv);
  assert.ok(inRange(r.score));
  assert.ok(r.missingSections.includes("Professional summary"));
  assert.ok(r.missingSections.includes("Work experience"));
});
