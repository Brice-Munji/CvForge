"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Loader2, AlertCircle, Plus, ArrowRight } from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input, FieldGroup } from "@/components/ui/Field";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CVOption {
  id: string;
  title: string;
  template: string;
  updatedAt: string;
}

export function NewCoverLetterClient({
  user,
  cvs,
}: {
  user: HeaderUser;
  cvs: CVOption[];
}) {
  const router = useRouter();
  const [selectedCv, setSelectedCv] = useState<string | null>(cvs[0]?.id ?? null);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (creating) return;
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: selectedCv,
          companyName,
          jobTitle,
          hiringManager,
          companyLocation,
        }),
      });
      if (!res.ok) throw new Error();
      const { coverLetter } = await res.json();
      router.push(`/cover-letters/${coverLetter.id}`);
    } catch {
      setError("We couldn't create your cover letter. Please try again.");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} nav />
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="eyebrow">New cover letter</p>
        <h1 className="mt-2 text-heading font-extrabold text-ink">
          Write a cover letter
        </h1>
        <p className="mt-2 text-ink-muted">
          Pick a CV to reuse your details, add the job information, and we&apos;ll
          give you a professional starting point to edit.
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {cvs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <FileText className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-ink">
              Create a CV first
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-ink-muted">
              Your cover letter reuses your CV details. Create a CV and then come
              back to write a tailored cover letter.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="/builder/new">
                <Plus className="h-[18px] w-[18px]" /> Create CV
              </Button>
            </div>
          </div>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
                1. Select a CV
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {cvs.map((cv) => {
                  const active = selectedCv === cv.id;
                  return (
                    <button
                      key={cv.id}
                      type="button"
                      onClick={() => setSelectedCv(cv.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20"
                          : "border-line bg-surface hover:border-ink/25"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{cv.title}</p>
                        <p className="mt-0.5 text-xs capitalize text-ink-muted">
                          {cv.template} · Updated {relativeTime(cv.updatedAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                          active
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-line-strong text-transparent"
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
                2. Job details
              </h2>
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2">
                <FieldGroup label="Company name">
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="XYZ Technologies"
                  />
                </FieldGroup>
                <FieldGroup label="Job title">
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Frontend Developer"
                  />
                </FieldGroup>
                <FieldGroup label="Hiring manager (optional)">
                  <Input
                    value={hiringManager}
                    onChange={(e) => setHiringManager(e.target.value)}
                    placeholder="Sarah Williams"
                  />
                </FieldGroup>
                <FieldGroup label="Company location (optional)">
                  <Input
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    placeholder="Douala, Cameroon"
                  />
                </FieldGroup>
              </div>
            </section>

            <div className="mt-8 flex justify-end">
              <Button onClick={create} size="lg" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-[18px] w-[18px] animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    Create cover letter <ArrowRight className="h-[18px] w-[18px]" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
