"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusSelect } from "@/components/app/StatusSelect";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ApplicationFunnel, StatTiles } from "./ApplicationFunnel";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUSES,
  type ApplicationStats,
  type ApplicationStatus,
} from "@/lib/application-types";
import type { ApplicationListItem } from "@/lib/server/application-service";

type SortKey = "newest" | "oldest" | "updated";

export function ApplicationsClient({
  user,
  initial,
  initialStats,
}: {
  user: HeaderUser;
  initial: ApplicationListItem[];
  initialStats: ApplicationStats;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [stats, setStats] = useState(initialStats);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | ApplicationStatus>("All");
  const [sort, setSort] = useState<SortKey>("updated");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApplicationListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recomputeStats = (list: ApplicationListItem[]): ApplicationStats => {
    const c = (s: ApplicationStatus) => list.filter((x) => x.status === s).length;
    const interviews = c("Interview");
    const offers = c("Offer");
    const rejected = c("Rejected");
    return {
      total: list.length,
      active: c("Saved") + c("Preparing") + c("Applied") + interviews,
      applied: c("Applied") + interviews + offers + rejected,
      interviews,
      offers,
      rejected,
    };
  };

  const visible = useMemo(() => {
    let list = items;
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (a) =>
          a.companyName.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q)
      );
    if (filter !== "All") list = list.filter((a) => a.status === filter);
    const sorted = [...list].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
    return sorted;
  }, [items, query, filter, sort]);

  const changeStatus = async (id: string, status: ApplicationStatus) => {
    setBusyId(id);
    setError(null);
    const prev = items;
    const next = items.map((a) => (a.id === id ? { ...a, status } : a));
    setItems(next);
    setStats(recomputeStats(next));
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems(prev);
      setStats(recomputeStats(prev));
      setError("We couldn't update the status. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      const next = items.filter((a) => a.id !== deleteTarget.id);
      setItems(next);
      setStats(recomputeStats(next));
      setDeleteTarget(null);
    } catch {
      setError("We couldn't delete this application. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const open = (id: string) => router.push(`/applications/${id}`);

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} nav />
      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Applications</p>
            <h1 className="mt-2 text-heading font-extrabold text-ink">
              Track your job applications
            </h1>
            <p className="mt-2 max-w-lg text-ink-muted">
              Keep every application, its status and its documents in one place.
            </p>
          </div>
          <Button href="/applications/new" size="lg" className="shrink-0">
            <Plus className="h-[18px] w-[18px]" /> Track a Job Application
          </Button>
        </div>

        {items.length > 0 && (
          <div className="mt-8 space-y-4">
            <StatTiles stats={stats} />
            <ApplicationFunnel stats={stats} />
          </div>
        )}

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
              <Briefcase className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-ink">
              No applications yet.
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-ink-muted">
              Keep your job search organized in one place.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="/applications/new" size="lg">
                <Plus className="h-[18px] w-[18px]" /> Track Application
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search company or position"
                  aria-label="Search applications"
                  className="w-full rounded-xl border border-line-strong bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="sr-only">
                  Sort applications
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm font-medium text-ink"
                >
                  <option value="updated">Recently updated</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            {/* Filter chips */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {(["All", ...APPLICATION_STATUSES] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    filter === s
                      ? "border-ink bg-ink text-canvas"
                      : "border-line-strong text-ink-soft hover:border-ink/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Desktop table */}
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date applied</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-line last:border-0 transition-colors hover:bg-canvas/60"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => open(a.id)}
                          className="font-semibold text-ink hover:text-brand-700"
                        >
                          {a.companyName || "Untitled company"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {a.jobTitle || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect
                          value={a.status}
                          onChange={(s) => changeStatus(a.id, s)}
                          busy={busyId === a.id}
                        />
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {a.applicationDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {relativeTime(a.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => open(a.id)}
                            aria-label="Open application"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(a)}
                            aria-label="Delete application"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-ink-muted">
                  No applications match your search.
                </p>
              )}
            </div>

            {/* Mobile cards */}
            <div className="mt-5 space-y-3 md:hidden">
              <AnimatePresence mode="popLayout">
                {visible.map((a) => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border border-line bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => open(a.id)} className="min-w-0 text-left">
                        <h3 className="truncate font-display text-base font-bold text-ink">
                          {a.companyName || "Untitled company"}
                        </h3>
                        <p className="truncate text-sm text-ink-muted">
                          {a.jobTitle || "—"}
                        </p>
                      </button>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <span className="text-xs text-ink-muted">
                        Updated {relativeTime(a.updatedAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        <StatusSelect
                          value={a.status}
                          onChange={(s) => changeStatus(a.id, s)}
                          busy={busyId === a.id}
                          align="right"
                        />
                        <button
                          onClick={() => setDeleteTarget(a)}
                          aria-label="Delete application"
                          className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {visible.length === 0 && (
                <p className="py-8 text-center text-sm text-ink-muted">
                  No applications match your search.
                </p>
              )}
            </div>
          </>
        )}
      </main>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        labelledBy="app-delete"
      >
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2 id="app-delete" className="font-display text-xl font-bold text-ink">
          Delete this application?
        </h2>
        <p className="mt-2 text-ink-muted">
          <span className="font-medium text-ink">
            {deleteTarget?.companyName || "This application"}
          </span>{" "}
          will be permanently removed. This action cannot be undone.
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
