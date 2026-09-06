"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanSearch,
  Target,
  Loader2,
  AlertCircle,
  X,
  Trash2,
  FileText,
  Plus,
  History,
  ArrowLeft,
} from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { PremiumUpgradeModal } from "@/components/billing/PremiumUpgradeModal";
import { AtsResultView } from "@/components/ats/AtsResultView";
import { relativeTime } from "@/lib/format";
import type { AtsAnalysisItem } from "@/lib/server/ats-service";

type CVOption = { id: string; title: string };
type Usage = { used: number; limit: number | null };

export function AtsClient({
  user,
  cvs,
  initialAnalyses,
  isPro,
  usage: initialUsage,
}: {
  user: HeaderUser;
  cvs: CVOption[];
  initialAnalyses: AtsAnalysisItem[];
  isPro: boolean;
  usage: Usage;
}) {
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [usage, setUsage] = useState(initialUsage);
  const [selectedCvId, setSelectedCvId] = useState(cvs[0]?.id ?? "");
  const [tab, setTab] = useState<"cv" | "job">("cv");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<AtsAnalysisItem | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AtsAnalysisItem | null>(null);

  const noCvs = cvs.length === 0;
  const remaining =
    usage.limit === null ? null : Math.max(0, usage.limit - usage.used);

  const run = async () => {
    if (loading) return;
    if (!selectedCvId) {
      setError("Please choose a CV first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: selectedCvId,
          mode: tab === "job" ? "JOB" : "CV",
          jobTitle,
          jobDescription,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403 && data?.code === "UPGRADE_REQUIRED") {
        setUpgradeOpen(true);
        return;
      }
      if (!res.ok) {
        setError(data?.error || "We couldn't run your check. Please try again.");
        return;
      }
      const item: AtsAnalysisItem = data.analysis;
      setAnalyses((prev) => [item, ...prev]);
      setCurrent(item);
      setUsage((u) => ({ ...u, used: u.used + 1 }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    if (current?.id === id) setCurrent(null);
    try {
      await fetch(`/api/ats/${id}`, { method: "DELETE" });
    } catch {
      /* optimistic — non-critical */
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} nav />
      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">ATS analyzer</p>
            <h1 className="mt-2 text-heading font-extrabold text-ink">
              CV & job match checker
            </h1>
            <p className="mt-2 max-w-xl text-ink-muted">
              A fast, rule-based estimate of how your CV reads to applicant
              tracking systems — with clear, honest suggestions to improve it.
            </p>
          </div>
          {!isPro && (
            <div className="shrink-0 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm">
              <span className="font-semibold text-ink">
                {remaining ?? "∞"}
              </span>
              <span className="text-ink-muted">
                {" "}
                free check{remaining === 1 ? "" : "s"} left this month
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </span>
            <button onClick={() => setError(null)} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {noCvs ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <FileText className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-ink">
              Build a CV first
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-ink-muted">
              Create a CV and then run an ATS check to see your CVForge Match
              Score.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="/builder" size="lg">
                <Plus className="h-[18px] w-[18px]" /> Create a CV
              </Button>
            </div>
          </div>
        ) : current ? (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setCurrent(null)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" /> Back to checker
            </button>
            <AtsResultView result={current.result} />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Control panel */}
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              {/* Tabs */}
              <div className="flex gap-1 rounded-xl bg-canvas p-1">
                <button
                  type="button"
                  onClick={() => setTab("cv")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    tab === "cv"
                      ? "bg-surface text-ink shadow-subtle"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <ScanSearch className="h-4 w-4" /> Check My CV
                </button>
                <button
                  type="button"
                  onClick={() => setTab("job")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    tab === "job"
                      ? "bg-surface text-ink shadow-subtle"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <Target className="h-4 w-4" /> Match My CV to a Job
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">
                    Select a CV
                  </label>
                  <select
                    value={selectedCvId}
                    onChange={(e) => setSelectedCvId(e.target.value)}
                    className="w-full rounded-xl border border-line-strong bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500"
                  >
                    {cvs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <AnimatePresence initial={false}>
                  {tab === "job" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-ink">
                          Job title{" "}
                          <span className="font-normal text-ink-faint">
                            (optional)
                          </span>
                        </label>
                        <input
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g. Frontend Developer"
                          className="w-full rounded-xl border border-line-strong bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-ink">
                          Job description
                        </label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          rows={8}
                          placeholder="Paste the full job description here…"
                          className="w-full resize-y rounded-xl border border-line-strong bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500"
                        />
                        <p className="mt-1 text-xs text-ink-faint">
                          We compare your CV against this text — nothing is sent
                          to any AI service.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={run}
                  size="lg"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-[18px] w-[18px] animate-spin" />
                      Analyzing…
                    </>
                  ) : tab === "cv" ? (
                    <>
                      <ScanSearch className="h-[18px] w-[18px]" /> Check My CV
                    </>
                  ) : (
                    <>
                      <Target className="h-[18px] w-[18px]" /> Match My CV
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* History */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                <History className="h-4 w-4" /> Recent checks
              </div>
              {analyses.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-4 py-8 text-center text-sm text-ink-muted">
                  Your saved checks will appear here.
                </p>
              ) : (
                <ul className="space-y-2">
                  {analyses.map((a) => (
                    <li
                      key={a.id}
                      className="group flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
                    >
                      <button
                        type="button"
                        onClick={() => setCurrent(a)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                            a.score >= 75
                              ? "bg-emerald-50 text-emerald-600"
                              : a.score >= 50
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {a.score}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {a.mode === "JOB"
                              ? a.jobTitle || "Job match"
                              : "CV Check"}
                          </span>
                          <span className="block truncate text-xs text-ink-faint">
                            {a.cvTitle} · {relativeTime(a.createdAt)}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(a)}
                        aria-label="Delete analysis"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-lift"
            >
              <h2 className="font-display text-lg font-bold text-ink">
                Delete this check?
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                This analysis will be permanently removed from your history.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 shadow-none hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="You've used your free ATS checks"
        message="Upgrade to CVForge Pro for unlimited CV checks and job matching."
      />
    </div>
  );
}
