"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  Plus,
  FileText,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  Trash2,
} from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CVCard } from "@/components/app/CVCard";
import type { CVListItem } from "@/lib/server/cv-service";
import type { TemplateId } from "@/lib/cv-types";

const QUICK_TEMPLATES: { id: TemplateId; name: string; note: string }[] = [
  { id: "classic", name: "Classic", note: "Timeless & recruiter-friendly" },
  { id: "modern", name: "Modern", note: "Bold header with skills sidebar" },
  { id: "minimal", name: "Minimal", note: "Clean and understated" },
];

export function DashboardClient({
  user,
  initialCVs,
}: {
  user: HeaderUser;
  initialCVs: CVListItem[];
}) {
  const router = useRouter();
  const [cvs, setCvs] = useState<CVListItem[]>(initialCVs);
  const [creating, setCreating] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CVListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!res.ok) throw new Error();
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
      <AppHeader user={user} />

      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="mt-2 text-heading font-extrabold text-ink">
              Let&apos;s build your next CV{firstName ? `, ${firstName}` : ""}.
            </h1>
            <p className="mt-2 max-w-lg text-ink-muted">
              Create, edit and manage your CVs. Everything saves automatically as
              you go.
            </p>
          </div>
          <Button
            onClick={() => handleCreate("classic")}
            size="lg"
            className="shrink-0"
            disabled={creating}
          >
            {creating ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                Creating CV…
              </>
            ) : (
              <>
                <Plus className="h-[18px] w-[18px]" />
                Create New CV
              </>
            )}
          </Button>
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

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            {isEmpty ? "Get started" : "Your CVs"}
          </h2>

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
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleCreate(t.id)}
                disabled={creating}
                className="group rounded-2xl border border-line bg-surface p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-600/40 hover:shadow-card disabled:opacity-60"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-ink">
                    {t.name}
                  </h3>
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-canvas text-ink-muted transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Plus className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{t.note}</p>
              </button>
            ))}
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
    </div>
  );
}
