"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Plus, Trash2, Loader2, AlertCircle, X, Pencil } from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { relativeTime } from "@/lib/format";
import type { CoverLetterListItem } from "@/lib/server/cover-letter-service";

export function CoverLettersClient({
  user,
  initial,
}: {
  user: HeaderUser;
  initial: CoverLetterListItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CoverLetterListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/cover-letters/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setItems((l) => l.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("We couldn't delete this cover letter. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} nav />
      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Cover letters</p>
            <h1 className="mt-2 text-heading font-extrabold text-ink">
              Your cover letters
            </h1>
            <p className="mt-2 max-w-lg text-ink-muted">
              Tailored letters for each role, built from your CV.
            </p>
          </div>
          <Button
            onClick={() => {
              setCreating(true);
              router.push("/cover-letters/new");
            }}
            size="lg"
            className="shrink-0"
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <Plus className="h-[18px] w-[18px]" />
            )}
            Create Cover Letter
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

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Mail className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-ink">
              No cover letters yet.
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-ink-muted">
              Create a tailored cover letter for your next application.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="/cover-letters/new" size="lg">
                <Plus className="h-[18px] w-[18px]" /> Create Cover Letter
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {items.map((cl) => (
                <motion.div
                  key={cl.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-subtle transition-shadow hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-canvas px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-muted">
                      {cl.template}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/cover-letters/${cl.id}`)}
                    className="mt-4 text-left"
                  >
                    <h3 className="line-clamp-2 font-display text-[1.02rem] font-bold text-ink">
                      {cl.title}
                    </h3>
                    <p className="mt-1 text-xs text-ink-muted">
                      {cl.companyName?.trim()
                        ? `${cl.jobTitle || "Role"} · ${cl.companyName}`
                        : "No company yet"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      Updated {relativeTime(cl.updatedAt)}
                    </p>
                  </button>
                  <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                    <Button
                      href={`/cover-letters/${cl.id}`}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cl)}
                      aria-label={`Delete ${cl.title}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        labelledBy="cl-list-delete"
      >
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2 id="cl-list-delete" className="font-display text-xl font-bold text-ink">
          Delete this cover letter?
        </h2>
        <p className="mt-2 text-ink-muted">
          <span className="font-medium text-ink">{deleteTarget?.title}</span> will
          be permanently deleted. This action cannot be undone.
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
              "Delete"
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
