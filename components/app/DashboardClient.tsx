"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  FileText,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Mail,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CVCard } from "@/components/app/CVCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ProBadge } from "@/components/billing/ProBadge";
import { PremiumUpgradeModal } from "@/components/billing/PremiumUpgradeModal";
import { relativeTime } from "@/lib/format";
import type { ViewerPlan } from "@/lib/plan-client";
import type { CVListItem } from "@/lib/server/cv-service";
import type { ApplicationListItem } from "@/lib/server/application-service";
import type { ApplicationStats } from "@/lib/application-types";
import type { TemplateId } from "@/lib/cv-types";

const QUICK_TEMPLATES: { id: TemplateId; name: string; note: string }[] = [
  { id: "classic", name: "Classic", note: "Timeless & recruiter-friendly" },
  { id: "modern", name: "Modern", note: "Bold header with skills sidebar" },
  { id: "minimal", name: "Minimal", note: "Clean and understated" },
];

export function DashboardClient({
  user,
  initialCVs,
  stats,
  recentApplications,
  plan,
}: {
  user: HeaderUser;
  initialCVs: CVListItem[];
  stats: ApplicationStats;
  recentApplications: ApplicationListItem[];
  plan: ViewerPlan;
}) {
  const router = useRouter();
  const [cvs, setCvs] = useState<CVListItem[]>(initialCVs);
  const [creating, setCreating] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CVListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  const firstName = (user.name?.trim() || "").split(" ")[0];

  const handleCreate = async (template: TemplateId = "classic") => {
    if (creating) return;
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 403 && body.code === "UPGRADE_REQUIRED") {
          setUpgradeMsg(body.error || "Upgrade to create more CVs.");
          setCreating(false);
          return;
        }
        throw new Error();
      }
      const { cv } = await res.json();
      router.push(`/builder/${cv.id}`);
    } catch {
      setError("We couldn't create your CV. Please try again.");
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (duplicatingId) return;
    setError(null);
    setDuplicatingId(id);
    try {
      const res = await fetch(`/api/cv/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { cv } = await res.json();
      setCvs((list) => [cv, ...list]);
    } catch {
      setError("We couldn't duplicate this CV. Please try again.");
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/cv/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setCvs((list) => list.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("We couldn't delete this CV. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const isEmpty = cvs.length === 0;

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} nav />

      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-14">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-heading font-extrabold text-ink">
            {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
          </h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Everything you need to apply with confidence — your CVs, cover
            letters, application emails and job tracking, in one place.
          </p>
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

        {/* Free-plan usage + upgrade nudge */}
        {!plan.isPro && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-sm font-semibold text-ink">Free plan</span>
              <Usage label="CVs" used={plan.usage.cvCount} max={plan.limits.maxCVs} />
              <Usage
                label="PDFs / mo"
                used={plan.usage.pdfExportCount}
                max={plan.limits.maxPdfExportsPerPeriod}
              />
              <Usage
                label="Applications"
                used={plan.usage.applicationCount}
                max={plan.limits.maxApplications}
              />
            </div>
            <Button href="/pricing" size="sm" className="shrink-0">
              <Sparkles className="h-4 w-4" /> Upgrade to Pro
            </Button>
          </div>
        )}

        {/* Quick actions */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <QuickAction
              icon={<FileText className="h-5 w-5" />}
              label="Create CV"
              onClick={() => handleCreate("classic")}
              busy={creating}
            />
            <QuickAction
              icon={<Mail className="h-5 w-5" />}
              label="Write Cover Letter"
              href="/cover-letters/new"
              pro={!plan.isPro}
            />
            <QuickAction
              icon={<Briefcase className="h-5 w-5" />}
              label="Create Application"
              href="/applications/new"
            />
            <QuickAction
              icon={<Sparkles className="h-5 w-5" />}
              label="Track Application"
              href="/applications"
            />
          </div>
        </section>

        {/* Your job applications */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Your job applications
            </h2>
            <Link
              href="/applications"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Applications", value: stats.total },
              { label: "Sent", value: stats.applied },
              { label: "Interviews", value: stats.interviews },
              { label: "Offers", value: stats.offers },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-line bg-surface px-4 py-4"
              >
                <p className="font-display text-3xl font-extrabold text-ink">
                  {s.value}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {recentApplications.length > 0 ? (
            <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {recentApplications.map((a) => (
                <Link
                  key={a.id}
                  href={`/applications/${a.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-canvas/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {a.companyName || "Untitled company"}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {a.jobTitle || "—"} · Updated {relativeTime(a.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-5 py-6 text-center sm:flex-row sm:text-left">
              <p className="text-sm text-ink-muted">
                No applications yet — keep your job search organized in one place.
              </p>
              <Button href="/applications/new" className="shrink-0">
                <Plus className="h-4 w-4" /> Track a Job Application
              </Button>
            </div>
          )}
        </section>

        {/* CVs */}
        <section id="cvs" className="mt-12 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
              {isEmpty ? "Get started with a CV" : "Your CVs"}
            </h2>
            {!isEmpty && (
              <Button
                onClick={() => handleCreate("classic")}
                size="sm"
                disabled={creating}
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                New CV
              </Button>
            )}
          </div>

          {isEmpty ? (
            <div className="mt-5 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <FileText className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 font-display text-2xl font-extrabold text-ink text-balance">
                Your next opportunity starts here.
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-ink-muted text-pretty">
                Create your first professional CV and make a stronger first
                impression.
              </p>
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => handleCreate("classic")}
                  size="lg"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-[18px] w-[18px] animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="h-[18px] w-[18px]" />
                      Create My CV
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {cvs.map((cv) => (
                  <CVCard
                    key={cv.id}
                    item={cv}
                    onDuplicate={handleDuplicate}
                    onDelete={setDeleteTarget}
                    duplicating={duplicatingId === cv.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Template quick-start */}
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Start from a template
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {QUICK_TEMPLATES.map((t) => {
              const locked = !plan.isPro && t.id !== "classic";
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    locked
                      ? setUpgradeMsg(
                          "Modern and Minimal templates are part of CVForge Pro."
                        )
                      : handleCreate(t.id)
                  }
                  disabled={creating}
                  className="group rounded-2xl border border-line bg-surface p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-600/40 hover:shadow-card disabled:opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                      {t.name}
                      {locked && <ProBadge size="xs" />}
                    </h3>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-canvas text-ink-muted transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Plus className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{t.note}</p>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        labelledBy="delete-title"
      >
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2 id="delete-title" className="font-display text-xl font-bold text-ink">
          Delete this CV?
        </h2>
        <p className="mt-2 text-ink-muted">
          <span className="font-medium text-ink">{deleteTarget?.title}</span> and
          all of its information will be permanently deleted. This can&apos;t be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
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

      <PremiumUpgradeModal
        open={Boolean(upgradeMsg)}
        onClose={() => setUpgradeMsg(null)}
        message={upgradeMsg ?? undefined}
      />
    </div>
  );
}

function Usage({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number | null;
}) {
  return (
    <span className="text-sm text-ink-muted">
      {label}:{" "}
      <span className="font-semibold text-ink">
        {max === null ? "Unlimited" : `${used} / ${max}`}
      </span>
    </span>
  );
}

function QuickAction({
  icon,
  label,
  href,
  onClick,
  busy,
  pro,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  busy?: boolean;
  pro?: boolean;
}) {
  const inner = (
    <>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        {label}
        {pro && <ProBadge size="xs" />}
      </span>
    </>
  );
  const cls =
    "group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-600/40 hover:shadow-card disabled:opacity-60";
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={busy} className={cls}>
      {inner}
    </button>
  );
}
