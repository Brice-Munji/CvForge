"use client";

import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Info,
  Tag,
  Briefcase,
} from "lucide-react";
import type { AtsResult } from "@/lib/ats/types";

function scoreTone(score: number): { ring: string; text: string; label: string } {
  if (score >= 75)
    return { ring: "text-emerald-500", text: "text-emerald-600", label: "Strong" };
  if (score >= 50)
    return { ring: "text-amber-500", text: "text-amber-600", label: "Fair" };
  return { ring: "text-red-500", text: "text-red-600", label: "Needs work" };
}

function ScoreRing({ score }: { score: number }) {
  const tone = scoreTone(score);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative grid h-36 w-36 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-ink/[0.08]" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={tone.ring}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-extrabold ${tone.text}`}>{score}</span>
        <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-muted">
          / 100
        </span>
      </div>
    </div>
  );
}

function Chips({
  items,
  tone,
}: {
  items: string[];
  tone: "good" | "bad" | "neutral";
}) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "bad"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-canvas text-ink-soft border-line";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className={`rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center gap-2 text-sm font-bold text-ink">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

export function AtsResultView({ result }: { result: AtsResult }) {
  const tone = scoreTone(result.score);
  const isJob = result.mode === "JOB";

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center">
        <ScoreRing score={result.score} />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="eyebrow">CVForge Match Score</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            {tone.label}
            {isJob && result.jobTitle ? (
              <span className="text-ink-muted"> · {result.jobTitle}</span>
            ) : null}
          </h2>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {result.disclaimer}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="mb-3 text-sm font-bold text-ink">Score breakdown</p>
        <div className="space-y-2.5">
          {result.breakdown.map((b) => (
            <div key={b.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-soft">{b.label}</span>
                <span className="font-semibold text-ink">{b.score}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.07]">
                <div
                  className={`h-full rounded-full ${
                    b.score >= 75
                      ? "bg-emerald-500"
                      : b.score >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${b.score}%` }}
                />
              </div>
              <p className="mt-1 text-[0.7rem] text-ink-faint">{b.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {result.strengths.length > 0 && (
          <Section
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            title="Strengths"
          >
            <ul className="space-y-1.5 text-sm text-ink-soft">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {result.weaknesses.length > 0 && (
          <Section
            icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
            title="Weaknesses"
          >
            <ul className="space-y-1.5 text-sm text-ink-soft">
              {result.weaknesses.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {isJob && result.matchingSkills.length > 0 && (
        <Section
          icon={<Tag className="h-4 w-4 text-emerald-600" />}
          title="Matching skills"
        >
          <Chips items={result.matchingSkills} tone="good" />
        </Section>
      )}

      {isJob && result.missingSkills.length > 0 && (
        <Section
          icon={<Tag className="h-4 w-4 text-red-600" />}
          title="Missing skills"
        >
          <Chips items={result.missingSkills} tone="bad" />
        </Section>
      )}

      {result.matchingKeywords.length > 0 && (
        <Section
          icon={<Tag className="h-4 w-4 text-emerald-600" />}
          title={isJob ? "Matching keywords" : "Keywords found"}
        >
          <Chips items={result.matchingKeywords} tone="good" />
        </Section>
      )}

      {result.missingKeywords.length > 0 && (
        <Section
          icon={<Tag className="h-4 w-4 text-red-600" />}
          title="Missing keywords"
        >
          <Chips items={result.missingKeywords} tone="bad" />
        </Section>
      )}

      {isJob && result.relevantExperience.length > 0 && (
        <Section
          icon={<Briefcase className="h-4 w-4 text-brand-600" />}
          title="Relevant experience"
        >
          <ul className="space-y-2 text-sm text-ink-soft">
            {result.relevantExperience.map((e, i) => (
              <li key={i}>
                <span className="font-semibold text-ink">{e.position}</span>
                {e.company ? ` · ${e.company}` : ""}
                <div className="mt-1">
                  <Chips items={e.matchedTerms} tone="neutral" />
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(result.missingSections.length > 0 || result.presentSections.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {result.presentSections.length > 0 && (
            <Section
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              title="Sections present"
            >
              <Chips items={result.presentSections} tone="good" />
            </Section>
          )}
          {result.missingSections.length > 0 && (
            <Section
              icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
              title="Missing sections"
            >
              <Chips items={result.missingSections} tone="bad" />
            </Section>
          )}
        </div>
      )}

      {result.recommendations.length > 0 && (
        <Section
          icon={<Lightbulb className="h-4 w-4 text-brand-600" />}
          title="Recommendations"
        >
          <ol className="space-y-2 text-sm text-ink-soft">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[0.7rem] font-bold text-brand-700">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
