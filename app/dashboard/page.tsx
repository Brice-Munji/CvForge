"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { getUser } from "@/lib/auth";

export default function DashboardPage() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const u = getUser();
    setName(u?.name?.split(" ")[0] || "");
  }, []);

  // Sprint 1: no persisted CVs yet — always shows the empty state.
  const cvs: never[] = [];

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />

      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="mt-2 text-heading font-extrabold text-ink">
              Let&apos;s build your next CV{name ? `, ${name}` : ""}.
            </h1>
            <p className="mt-2 max-w-lg text-ink-muted">
              Start a new CV, pick a template, and let the live preview do the
              heavy lifting.
            </p>
          </div>
          <Button href="/builder/new" size="lg" className="shrink-0">
            <Plus className="h-[18px] w-[18px]" />
            Create New CV
          </Button>
        </div>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Recent CVs
          </h2>

          {cvs.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <FileText className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">
                Your CVs will appear here.
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-ink-muted">
                You haven&apos;t created any CVs yet. Start your first one — it
                only takes a few minutes.
              </p>
              <div className="mt-6 flex justify-center">
                <Button href="/builder/new" size="lg">
                  <Plus className="h-[18px] w-[18px]" />
                  Create your first CV
                </Button>
              </div>
            </div>
          ) : null}
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
            {[
              { id: "classic", name: "Classic", note: "Timeless & recruiter-friendly" },
              { id: "modern", name: "Modern", note: "Bold header with skills sidebar" },
              { id: "minimal", name: "Minimal", note: "Clean and understated" },
            ].map((t) => (
              <Link
                key={t.id}
                href={`/builder/new?template=${t.id}`}
                className="group rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-600/40 hover:shadow-card"
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
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
