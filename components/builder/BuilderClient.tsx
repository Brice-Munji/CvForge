"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  X,
  Copy,
  Trash2,
  MoreHorizontal,
  Loader2,
  Download,
  Printer,
} from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { A4Frame } from "@/components/cv/A4Frame";
import { CVDocument } from "@/components/cv/CVDocument";
import { SaveIndicator, type SaveStatus } from "./SaveIndicator";
import { useExport } from "./useExport";
import { ExportModal } from "./ExportModal";
import { DownloadButton } from "./DownloadButton";
import {
  PersonalSection,
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  LanguagesSection,
} from "./SectionForms";
import {
  type CVData,
  type TemplateId,
  type PersonalInfo,
} from "@/lib/cv-types";
import { isValidEmail } from "@/lib/validation";
import { isPremiumTemplate } from "@/lib/entitlements";
import { PremiumUpgradeModal } from "@/components/billing/PremiumUpgradeModal";
import { ProBadge } from "@/components/billing/ProBadge";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type StepKey =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "summary", label: "Summary" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages" },
];

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

const AUTOSAVE_DELAY = 900;

export function BuilderClient({
  user,
  cvId,
  initialTitle,
  initialData,
  isPro,
}: {
  user: HeaderUser;
  cvId: string;
  initialTitle: string;
  initialData: CVData;
  isPro: boolean;
}) {
  const router = useRouter();
  const [templateUpgrade, setTemplateUpgrade] = useState<string | null>(null);
  const [cv, setCv] = useState<CVData>(initialData);
  const [title, setTitle] = useState(initialTitle);
  const [active, setActive] = useState(0);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const idc = useRef(0);
  const newId = (p: string) => `${p}-${(idc.current += 1)}`;
  const step = STEPS[active];

  /* ------------- autosave ------------- */
  const latest = useRef({ cv, title });
  latest.current = { cv, title };
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const pending = useRef(false); // unsaved edits exist
  const inFlight = useRef<Promise<void> | null>(null);
  const skipFirst = useRef(true);

  // Single POST that persists the latest state.
  const doSave = useCallback(async () => {
    const { cv: c, title: t } = latest.current;
    setStatus("saving");
    const res = await fetch(`/api/cv/${cvId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, ...c }),
    });
    if (!res.ok) throw new Error("save failed");
    pending.current = false;
    setStatus("saved");
  }, [cvId]);

  // Single-flight save: never runs two PATCHes at once.
  const runSave = useCallback(async () => {
    if (inFlight.current) {
      try {
        await inFlight.current;
      } catch {
        /* fall through to retry below */
      }
    }
    if (!pending.current) return;
    const p = doSave()
      .catch((e) => {
        setStatus("error");
        throw e;
      })
      .finally(() => {
        inFlight.current = null;
      });
    inFlight.current = p;
    await p;
  }, [doSave]);

  // Debounced autosave whenever content changes.
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    pending.current = true;
    setStatus("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      runSave().catch(() => {});
    }, AUTOSAVE_DELAY);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [cv, title, runSave]);

  // Retry handler for the save indicator.
  const retrySave = useCallback(() => {
    runSave().catch(() => {});
  }, [runSave]);

  // Flush any pending save immediately (used before exporting).
  const flushSave = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    if (inFlight.current) {
      try {
        await inFlight.current;
      } catch {
        /* will retry below if still pending */
      }
    }
    if (pending.current) await runSave();
  }, [runSave]);

  // Warn before leaving with unsaved work.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (pending.current || status === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);

  /* ------------- PDF export ------------- */
  const cvRef = useRef(cv);
  cvRef.current = cv;
  const {
    status: exportStatus,
    error: exportError,
    download: downloadPdf,
    reset: resetExport,
    upgrade: exportUpgrade,
    clearUpgrade: clearExportUpgrade,
  } = useExport({ cvId, getData: () => cvRef.current, flushSave });

  const upgradeMessage = templateUpgrade || exportUpgrade;
  const closeUpgrade = () => {
    setTemplateUpgrade(null);
    clearExportUpgrade();
  };

  // Choosing a template: premium templates are gated for Free users.
  const chooseTemplate = (t: TemplateId) => {
    if (!isPro && isPremiumTemplate(t)) {
      setTemplateUpgrade(
        "Modern and Minimal templates are part of CVForge Pro."
      );
      return;
    }
    setTemplate(t);
  };

  /* ------------- validation ------------- */
  const errors = useMemo(() => {
    const er: Partial<Record<keyof PersonalInfo, string>> = {};
    if (!cv.personal.fullName.trim()) er.fullName = "Full name is required.";
    if (!cv.personal.email.trim()) er.email = "Email is required.";
    else if (!isValidEmail(cv.personal.email))
      er.email = "Enter a valid email address.";
    return er;
  }, [cv.personal.fullName, cv.personal.email]);

  /* ------------- completion ------------- */
  const complete = useMemo<Record<StepKey, boolean>>(
    () => ({
      personal: Boolean(cv.personal.fullName.trim() && cv.personal.email.trim()),
      summary: cv.summary.trim().length > 0,
      experience: cv.experiences.length > 0,
      education: cv.educations.length > 0,
      skills: cv.skills.length > 0,
      projects: cv.projects.length > 0,
      certifications: cv.certifications.length > 0,
      languages: cv.languages.length > 0,
    }),
    [cv]
  );

  /* ------------- updaters ------------- */
  const setPersonal = (key: keyof PersonalInfo, value: string) =>
    setCv((d) => ({ ...d, personal: { ...d.personal, [key]: value } }));
  const setSummary = (value: string) => setCv((d) => ({ ...d, summary: value }));
  const setTemplate = (t: TemplateId) => setCv((d) => ({ ...d, template: t }));

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
          current: false,
          description: "",
        },
      ],
    }));
  const updateExperience = (id: string, patch: Partial<CVData["experiences"][number]>) =>
    setCv((d) => ({
      ...d,
      experiences: d.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  const removeExperience = (id: string) =>
    setCv((d) => ({ ...d, experiences: d.experiences.filter((e) => e.id !== id) }));

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
          description: "",
        },
      ],
    }));
  const updateEducation = (id: string, patch: Partial<CVData["educations"][number]>) =>
    setCv((d) => ({
      ...d,
      educations: d.educations.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  const removeEducation = (id: string) =>
    setCv((d) => ({ ...d, educations: d.educations.filter((e) => e.id !== id) }));

  const addSkill = () =>
    setCv((d) => ({
      ...d,
      skills: [...d.skills, { id: newId("sk"), name: "", level: "Intermediate" }],
    }));
  const updateSkill = (id: string, patch: Partial<CVData["skills"][number]>) =>
    setCv((d) => ({
      ...d,
      skills: d.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  const removeSkill = (id: string) =>
    setCv((d) => ({ ...d, skills: d.skills.filter((s) => s.id !== id) }));

  const addProject = () =>
    setCv((d) => ({
      ...d,
      projects: [
        ...d.projects,
        { id: newId("pr"), name: "", description: "", technologies: [], url: "" },
      ],
    }));
  const updateProject = (id: string, patch: Partial<CVData["projects"][number]>) =>
    setCv((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  const removeProject = (id: string) =>
    setCv((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));

  const addCertification = () =>
    setCv((d) => ({
      ...d,
      certifications: [
        ...d.certifications,
        { id: newId("cert"), name: "", issuer: "", date: "", url: "" },
      ],
    }));
  const updateCertification = (
    id: string,
    patch: Partial<CVData["certifications"][number]>
  ) =>
    setCv((d) => ({
      ...d,
      certifications: d.certifications.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));
  const removeCertification = (id: string) =>
    setCv((d) => ({
      ...d,
      certifications: d.certifications.filter((c) => c.id !== id),
    }));

  const addLanguage = () =>
    setCv((d) => ({
      ...d,
      languages: [
        ...d.languages,
        { id: newId("lang"), name: "", level: "Conversational" },
      ],
    }));
  const updateLanguage = (id: string, patch: Partial<CVData["languages"][number]>) =>
    setCv((d) => ({
      ...d,
      languages: d.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  const removeLanguage = (id: string) =>
    setCv((d) => ({ ...d, languages: d.languages.filter((l) => l.id !== id) }));

  /* ------------- CV-level actions ------------- */
  const handleDuplicate = async () => {
    if (duplicating) return;
    setDuplicating(true);
    try {
      const res = await fetch(`/api/cv/${cvId}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { cv: copy } = await res.json();
      pending.current = false;
      router.push(`/builder/${copy.id}`);
    } catch {
      setDuplicating(false);
      setMenuOpen(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cv/${cvId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      pending.current = false;
      router.push("/dashboard");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    // Opens a print-only view of just the CV in a new tab and prints it.
    window.open(`/builder/${cvId}/print`, "_blank", "noopener");
  };

  const goNext = () => setActive((i) => Math.min(i + 1, STEPS.length - 1));
  const goPrev = () => setActive((i) => Math.max(i - 1, 0));

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AppHeader
        user={user}
        backHref="/dashboard"
        center={
          <div className="hidden items-center justify-center md:flex">
            <SaveIndicator status={status} onRetry={retrySave} />
          </div>
        }
      />

      {/* Toolbar */}
      <div className="sticky top-16 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-2 px-4 py-2.5 sm:px-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="CV title"
            className="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-1 font-display text-base font-bold text-ink outline-none transition-colors hover:bg-ink/[0.03] focus:bg-ink/[0.04] sm:text-lg"
          />
          <div className="md:hidden">
            <SaveIndicator status={status} onRetry={retrySave} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden rounded-lg border border-line-strong bg-canvas p-0.5 sm:flex">
              {TEMPLATES.map((t) => {
                const locked = !isPro && isPremiumTemplate(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => chooseTemplate(t.id)}
                    aria-label={
                      locked ? `${t.label} template (Pro)` : `${t.label} template`
                    }
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                      cv.template === t.id
                        ? "bg-brand-600 text-white shadow-subtle"
                        : "text-ink-soft hover:text-ink"
                    )}
                  >
                    {t.label}
                    {locked && (
                      <Lock
                        className={cn(
                          "h-3 w-3",
                          cv.template === t.id ? "text-white/80" : "text-amber-500"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <DownloadButton
              status={exportStatus}
              onClick={downloadPdf}
              className="hidden lg:inline-flex"
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line-strong bg-surface text-ink-soft transition-colors hover:text-ink"
                aria-label="CV actions"
                aria-haspopup="menu"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lift"
                    role="menu"
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleDuplicate}
                      disabled={duplicating}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink disabled:opacity-60"
                      role="menuitem"
                    >
                      {duplicating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setMenuOpen(false);
                        handlePrint();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                      role="menuitem"
                    >
                      <Printer className="h-4 w-4" />
                      Print CV
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setMenuOpen(false);
                        setConfirmDelete(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      role="menuitem"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Edit/Preview toggle + template */}
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-2 px-4 pb-2.5 lg:hidden">
          <div className="flex flex-1 rounded-lg border border-line-strong bg-canvas p-0.5">
            <button
              type="button"
              onClick={() => setView("edit")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-semibold transition-colors",
                view === "edit" ? "bg-surface text-ink shadow-subtle" : "text-ink-muted"
              )}
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button
              type="button"
              onClick={() => setView("preview")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-semibold transition-colors",
                view === "preview"
                  ? "bg-surface text-ink shadow-subtle"
                  : "text-ink-muted"
              )}
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
          </div>
          <select
            value={cv.template}
            onChange={(e) => chooseTemplate(e.target.value as TemplateId)}
            aria-label="Template"
            className="rounded-lg border border-line-strong bg-surface px-2.5 py-2 text-sm font-semibold text-ink"
          >
            {TEMPLATES.map((t) => {
              const locked = !isPro && isPremiumTemplate(t.id);
              return (
                <option key={t.id} value={t.id} disabled={locked}>
                  {t.label}
                  {locked ? " (Pro)" : ""}
                </option>
              );
            })}
          </select>
          <DownloadButton status={exportStatus} onClick={downloadPdf} compact />
        </div>
      </div>

      {/* Main split: ~40% editor / ~60% preview */}
      <div className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]">
        {/* Editor */}
        <section
          className={cn(
            "min-w-0 px-4 py-6 sm:px-6",
            view === "preview" && "hidden lg:block"
          )}
        >
          {/* Step nav */}
          <nav className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  i === active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line-strong text-ink-soft hover:border-ink/30"
                )}
              >
                <span
                  className={cn(
                    "grid h-4 w-4 place-items-center rounded-full text-[0.6rem]",
                    complete[s.key]
                      ? i === active
                        ? "bg-white/25"
                        : "bg-brand-100 text-brand-700"
                      : i === active
                      ? "bg-white/25"
                      : "bg-line text-ink-faint"
                  )}
                >
                  {complete[s.key] ? <Check className="h-2.5 w-2.5" /> : i + 1}
                </span>
                {s.label}
              </button>
            ))}
          </nav>

          <div className="mb-1 text-xs font-medium text-ink-faint">
            Step {active + 1} of {STEPS.length}
          </div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {STEP_TITLES[step.key]}
          </h1>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              {step.key === "personal" && (
                <PersonalSection
                  personal={cv.personal}
                  onChange={setPersonal}
                  errors={errors}
                />
              )}
              {step.key === "summary" && (
                <SummarySection summary={cv.summary} onChange={setSummary} />
              )}
              {step.key === "experience" && (
                <ExperienceSection
                  items={cv.experiences}
                  onAdd={addExperience}
                  onUpdate={updateExperience}
                  onRemove={removeExperience}
                />
              )}
              {step.key === "education" && (
                <EducationSection
                  items={cv.educations}
                  onAdd={addEducation}
                  onUpdate={updateEducation}
                  onRemove={removeEducation}
                />
              )}
              {step.key === "skills" && (
                <SkillsSection
                  items={cv.skills}
                  onAdd={addSkill}
                  onUpdate={updateSkill}
                  onRemove={removeSkill}
                />
              )}
              {step.key === "projects" && (
                <ProjectsSection
                  items={cv.projects}
                  onAdd={addProject}
                  onUpdate={updateProject}
                  onRemove={removeProject}
                />
              )}
              {step.key === "certifications" && (
                <CertificationsSection
                  items={cv.certifications}
                  onAdd={addCertification}
                  onUpdate={updateCertification}
                  onRemove={removeCertification}
                />
              )}
              {step.key === "languages" && (
                <LanguagesSection
                  items={cv.languages}
                  onAdd={addLanguage}
                  onUpdate={updateLanguage}
                  onRemove={removeLanguage}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            <Button variant="secondary" onClick={goPrev} disabled={active === 0}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {active < STEPS.length - 1 ? (
              <Button onClick={goNext}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="secondary" href="/dashboard">
                Done
              </Button>
            )}
          </div>
        </section>

        {/* Preview */}
        <aside
          className={cn(
            "border-t border-line bg-[#F4F2EC] lg:border-l lg:border-t-0",
            view === "edit" && "hidden lg:block"
          )}
        >
          <div className="lg:sticky lg:top-[132px] lg:max-h-[calc(100vh-132px)] lg:overflow-y-auto lg:thin-scroll">
            <div className="p-5 sm:p-8">
              <p className="mb-4 hidden items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-faint lg:flex">
                <Eye className="h-3.5 w-3.5" /> Live preview
              </p>
              <A4Frame className="mx-auto max-w-[640px]">
                <CVDocument data={cv} />
              </A4Frame>
            </div>
          </div>
        </aside>
      </div>

      {/* Delete confirmation */}
      <Modal
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        labelledBy="builder-delete-title"
      >
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2
          id="builder-delete-title"
          className="font-display text-xl font-bold text-ink"
        >
          Delete this CV?
        </h2>
        <p className="mt-2 text-ink-muted">
          <span className="font-medium text-ink">{title}</span> and all of its
          information will be permanently deleted. This can&apos;t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 shadow-none hover:bg-red-700"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
              </>
            ) : (
              "Delete CV"
            )}
          </Button>
        </div>
      </Modal>

      {/* PDF export success / error feedback */}
      <ExportModal
        status={exportStatus}
        error={exportError}
        onClose={resetExport}
        onRetry={downloadPdf}
      />

      {/* Premium upgrade prompt (template lock or export limit) */}
      <PremiumUpgradeModal
        open={Boolean(upgradeMessage)}
        onClose={closeUpgrade}
        message={upgradeMessage ?? undefined}
      />
    </div>
  );
}

const STEP_TITLES: Record<StepKey, string> = {
  personal: "Personal Information",
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};
