"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Save,
} from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { A4Frame } from "@/components/cv/A4Frame";
import { CVDocument } from "@/components/cv/CVDocument";
import {
  createBlankCV,
  type CVData,
  type TemplateId,
  type PersonalInfo,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
} from "@/lib/cv-types";
import { cn } from "@/lib/utils";
import {
  PersonalSection,
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  UpcomingSection,
} from "./SectionForms";

type StepKey =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "references";

const STEPS: { key: StepKey; label: string; enabled: boolean }[] = [
  { key: "personal", label: "Personal Information", enabled: true },
  { key: "summary", label: "Professional Summary", enabled: true },
  { key: "experience", label: "Experience", enabled: true },
  { key: "education", label: "Education", enabled: true },
  { key: "skills", label: "Skills", enabled: true },
  { key: "projects", label: "Projects", enabled: false },
  { key: "certifications", label: "Certifications", enabled: false },
  { key: "languages", label: "Languages", enabled: false },
  { key: "references", label: "References", enabled: false },
];

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

export function BuilderClient({
  initialTemplate = "modern",
}: {
  initialTemplate?: TemplateId;
}) {
  const [cv, setCv] = useState<CVData>(() => createBlankCV(initialTemplate));
  const [title, setTitle] = useState("Untitled CV");
  const [active, setActive] = useState(0);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const idc = useRef(0);
  const newId = (p: string) => `${p}-${(idc.current += 1)}`;

  const step = STEPS[active];

  /* ---------- updaters ---------- */
  const setPersonal = (key: keyof PersonalInfo, value: string) =>
    setCv((d) => ({ ...d, personal: { ...d.personal, [key]: value } }));

  const setSummary = (value: string) => setCv((d) => ({ ...d, summary: value }));

  const addExperience = () =>
    setCv((d) => ({
      ...d,
      experiences: [
        ...d.experiences,
        {
          id: newId("exp"),
          position: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  const updateExperience = (
    id: string,
    key: keyof ExperienceItem,
    value: string
  ) =>
    setCv((d) => ({
      ...d,
      experiences: d.experiences.map((e) =>
        e.id === id ? { ...e, [key]: value } : e
      ),
    }));
  const removeExperience = (id: string) =>
    setCv((d) => ({
      ...d,
      experiences: d.experiences.filter((e) => e.id !== id),
    }));

  const addEducation = () =>
    setCv((d) => ({
      ...d,
      educations: [
        ...d.educations,
        {
          id: newId("edu"),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  const updateEducation = (
    id: string,
    key: keyof EducationItem,
    value: string
  ) =>
    setCv((d) => ({
      ...d,
      educations: d.educations.map((e) =>
        e.id === id ? { ...e, [key]: value } : e
      ),
    }));
  const removeEducation = (id: string) =>
    setCv((d) => ({
      ...d,
      educations: d.educations.filter((e) => e.id !== id),
    }));

  const addSkill = () =>
    setCv((d) => ({
      ...d,
      skills: [
        ...d.skills,
        { id: newId("sk"), name: "", level: "Intermediate" },
      ],
    }));
  const updateSkill = (id: string, key: keyof SkillItem, value: string) =>
    setCv((d) => ({
      ...d,
      skills: d.skills.map((s) =>
        s.id === id ? { ...s, [key]: value } : s
      ) as SkillItem[],
    }));
  const removeSkill = (id: string) =>
    setCv((d) => ({ ...d, skills: d.skills.filter((s) => s.id !== id) }));

  /* ---------- completion state ---------- */
  const complete = useMemo(() => {
    return {
      personal: Boolean(cv.personal.fullName.trim() && cv.personal.title.trim()),
      summary: cv.summary.trim().length > 0,
      experience: cv.experiences.length > 0,
      education: cv.educations.length > 0,
      skills: cv.skills.length > 0,
    } as Record<string, boolean>;
  }, [cv]);

  const setTemplate = (id: TemplateId) =>
    setCv((d) => ({ ...d, template: id }));

  const save = () => {
    try {
      window.localStorage.setItem(
        "cvforge:draft",
        JSON.stringify({ title, cv })
      );
    } catch {
      /* ignore */
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const goNext = () => setActive((i) => Math.min(i + 1, STEPS.length - 1));
  const goPrev = () => setActive((i) => Math.max(i - 1, 0));

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AppHeader backHref="/dashboard" />

      {/* Toolbar */}
      <div className="border-b border-line bg-surface/70">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="CV title"
            className="min-w-0 rounded-lg bg-transparent px-1 py-1 font-display text-lg font-bold text-ink outline-none transition-colors hover:bg-ink/[0.03] focus:bg-ink/[0.04]"
          />
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-line-strong bg-canvas p-0.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                    cv.template === t.id
                      ? "bg-brand-600 text-white shadow-subtle"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Button size="sm" variant={saved ? "secondary" : "primary"} onClick={save}>
              {saved ? (
                <>
                  <Check className="h-4 w-4" /> Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 gap-0 lg:grid-cols-[236px_minmax(0,1fr)_minmax(400px,44%)]">
        {/* Step rail (desktop) */}
        <aside className="hidden border-r border-line px-3 py-6 lg:block">
          <div className="sticky top-[80px]">
            <p className="px-3 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Sections
            </p>
            <nav className="space-y-0.5">
              {STEPS.map((s, i) => {
                const isActive = i === active;
                const done = complete[s.key];
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-ink-soft hover:bg-ink/[0.03] hover:text-ink"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold",
                        done
                          ? "bg-brand-600 text-white"
                          : isActive
                          ? "border border-brand-500 text-brand-600"
                          : "border border-line-strong text-ink-faint"
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{s.label}</span>
                    {!s.enabled && (
                      <span className="shrink-0 rounded bg-line px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ink-faint">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Form column */}
        <section className="min-w-0 px-4 py-6 pb-28 sm:px-8 lg:pb-8">
          {/* Mobile step chips */}
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  i === active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line-strong text-ink-soft"
                )}
              >
                {i + 1}. {s.label}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-ink-faint">
              Step {active + 1} of {STEPS.length}
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink">
              {step.label}
            </h1>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6"
              >
                {step.key === "personal" && (
                  <PersonalSection
                    personal={cv.personal}
                    onChange={setPersonal}
                  />
                )}
                {step.key === "summary" && (
                  <SummarySection summary={cv.summary} onChange={setSummary} />
                )}
                {step.key === "experience" && (
                  <ExperienceSection
                    items={cv.experiences}
                    add={addExperience}
                    update={updateExperience}
                    remove={removeExperience}
                  />
                )}
                {step.key === "education" && (
                  <EducationSection
                    items={cv.educations}
                    add={addEducation}
                    update={updateEducation}
                    remove={removeEducation}
                  />
                )}
                {step.key === "skills" && (
                  <SkillsSection
                    items={cv.skills}
                    add={addSkill}
                    update={updateSkill}
                    remove={removeSkill}
                  />
                )}
                {!step.enabled && <UpcomingSection title={step.label} />}
              </motion.div>
            </AnimatePresence>

            {/* Desktop step controls */}
            <div className="mt-8 hidden items-center justify-between border-t border-line pt-6 lg:flex">
              <Button
                variant="secondary"
                onClick={goPrev}
                disabled={active === 0}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={goNext} disabled={active === STEPS.length - 1}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Preview (desktop) */}
        <aside className="hidden border-l border-line bg-[#F4F2EC] lg:block">
          <div className="sticky top-[64px] max-h-[calc(100vh-64px)] overflow-y-auto p-6 thin-scroll">
            <p className="mb-4 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              <Eye className="h-3.5 w-3.5" /> Live preview
            </p>
            <A4Frame>
              <CVDocument data={cv} />
            </A4Frame>
          </div>
        </aside>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={active === 0}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line-strong bg-surface text-ink disabled:opacity-40"
            aria-label="Previous section"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Button
            variant="dark"
            className="flex-1"
            onClick={() => setMobilePreview(true)}
          >
            <Eye className="h-[18px] w-[18px]" /> Preview
          </Button>
          <button
            type="button"
            onClick={goNext}
            disabled={active === STEPS.length - 1}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line-strong bg-surface text-ink disabled:opacity-40"
            aria-label="Next section"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile preview overlay */}
      <AnimatePresence>
        {mobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#F4F2EC] lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-line bg-canvas px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Eye className="h-4 w-4 text-brand-600" /> CV Preview
              </p>
              <button
                type="button"
                onClick={() => setMobilePreview(false)}
                className="grid h-9 w-9 place-items-center rounded-lg text-ink hover:bg-ink/[0.05]"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <A4Frame className="mx-auto max-w-[520px]">
                <CVDocument data={cv} />
              </A4Frame>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
