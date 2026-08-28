"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Pencil, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, FieldGroup } from "@/components/ui/Field";
import { A4Frame } from "@/components/cv/A4Frame";
import { SaveIndicator } from "@/components/builder/SaveIndicator";
import { DownloadButton } from "@/components/builder/DownloadButton";
import { ExportModal } from "@/components/builder/ExportModal";
import type { ExportStatus } from "@/components/builder/useExport";
import { CoverLetterDocument } from "./CoverLetterDocument";
import { useAutosave } from "@/lib/use-autosave";
import { triggerBlobDownload } from "@/lib/pdf/download";
import { coverLetterFileName } from "@/lib/pdf/filename";
import {
  COVER_LETTER_TEMPLATES,
  type CoverLetterData,
  type CoverLetterTemplateId,
  type CoverLetterContent,
} from "@/lib/coverletter-types";
import { cn } from "@/lib/utils";

export function CoverLetterBuilder({
  user,
  id,
  initialTitle,
  initialData,
}: {
  user: HeaderUser;
  id: string;
  initialTitle: string;
  initialData: CoverLetterData;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [data, setData] = useState<CoverLetterData>(initialData);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const exportBusy = useRef(false);

  const saveFn = useCallback(
    async (payload: { title: string; data: CoverLetterData }) => {
      const res = await fetch(`/api/cover-letters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          template: payload.data.template,
          companyName: payload.data.companyName,
          jobTitle: payload.data.jobTitle,
          hiringManager: payload.data.hiringManager,
          companyLocation: payload.data.companyLocation,
          jobDescription: payload.data.jobDescription,
          content: payload.data.content,
        }),
      });
      if (!res.ok) throw new Error("save failed");
    },
    [id]
  );

  const { status, flush, retry } = useAutosave({ title, data }, saveFn);

  const setMeta = (key: keyof CoverLetterData, value: string) =>
    setData((d) => ({ ...d, [key]: value }));
  const setContent = (key: keyof CoverLetterContent, value: string) =>
    setData((d) => ({ ...d, content: { ...d.content, [key]: value } }));
  const setTemplate = (t: CoverLetterTemplateId) =>
    setData((d) => ({ ...d, template: t }));

  const handleDownload = useCallback(async () => {
    if (exportBusy.current) return;
    exportBusy.current = true;
    setExportError(null);
    try {
      setExportStatus("saving");
      await flush();
      setExportStatus("preparing");
      const res = await fetch(`/api/cover-letters/${id}/export`, {
        method: "POST",
      });
      if (!res.ok) {
        let msg = "Something went wrong while creating your PDF. Please try again.";
        try {
          const b = await res.json();
          if (b?.error) msg = b.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      triggerBlobDownload(blob, coverLetterFileName(data.content.senderName));
      setExportStatus("success");
    } catch (err) {
      setExportError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your PDF. Please try again."
      );
      setExportStatus("error");
    } finally {
      exportBusy.current = false;
    }
  }, [flush, id, data.content.senderName]);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cover-letters/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/cover-letters");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AppHeader
        user={user}
        backHref="/cover-letters"
        center={
          <div className="hidden items-center justify-center md:flex">
            <SaveIndicator status={status} onRetry={retry} />
          </div>
        }
      />

      {/* Toolbar */}
      <div className="sticky top-16 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-2 px-4 py-2.5 sm:px-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Cover letter title"
            className="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-1 font-display text-base font-bold text-ink outline-none transition-colors hover:bg-ink/[0.03] focus:bg-ink/[0.04] sm:text-lg"
          />
          <div className="md:hidden">
            <SaveIndicator status={status} onRetry={retry} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden rounded-lg border border-line-strong bg-canvas p-0.5 sm:flex">
              {COVER_LETTER_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                    data.template === t.id
                      ? "bg-brand-600 text-white shadow-subtle"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <DownloadButton
              status={exportStatus}
              onClick={handleDownload}
              className="hidden lg:inline-flex"
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line-strong bg-surface text-ink-soft transition-colors hover:text-ink"
                aria-label="Cover letter actions"
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
                    className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lift"
                    role="menu"
                  >
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

        {/* Mobile toggle + template + download */}
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
                view === "preview" ? "bg-surface text-ink shadow-subtle" : "text-ink-muted"
              )}
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
          </div>
          <select
            value={data.template}
            onChange={(e) => setTemplate(e.target.value as CoverLetterTemplateId)}
            aria-label="Template"
            className="rounded-lg border border-line-strong bg-surface px-2.5 py-2 text-sm font-semibold text-ink"
          >
            {COVER_LETTER_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <DownloadButton status={exportStatus} onClick={handleDownload} compact />
        </div>
      </div>

      {/* Main split */}
      <div className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,44%)_minmax(0,56%)]">
        {/* Editor */}
        <section
          className={cn(
            "min-w-0 px-4 py-6 sm:px-6",
            view === "preview" && "hidden lg:block"
          )}
        >
          <div className="mx-auto max-w-2xl space-y-7">
            <FormGroup title="Job details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label="Company name">
                  <Input
                    value={data.companyName}
                    onChange={(e) => setMeta("companyName", e.target.value)}
                    placeholder="XYZ Technologies"
                  />
                </FieldGroup>
                <FieldGroup label="Job title">
                  <Input
                    value={data.jobTitle}
                    onChange={(e) => setMeta("jobTitle", e.target.value)}
                    placeholder="Frontend Developer"
                  />
                </FieldGroup>
                <FieldGroup label="Hiring manager">
                  <Input
                    value={data.hiringManager}
                    onChange={(e) => setMeta("hiringManager", e.target.value)}
                    placeholder="Sarah Williams"
                  />
                </FieldGroup>
                <FieldGroup label="Company location">
                  <Input
                    value={data.companyLocation}
                    onChange={(e) => setMeta("companyLocation", e.target.value)}
                    placeholder="Douala, Cameroon"
                  />
                </FieldGroup>
              </div>
              <FieldGroup label="Job description (stored for later tailoring)" className="mt-4">
                <Textarea
                  value={data.jobDescription}
                  onChange={(e) => setMeta("jobDescription", e.target.value)}
                  placeholder="Paste the full job description here."
                  className="min-h-[90px]"
                />
              </FieldGroup>
            </FormGroup>

            <FormGroup title="The letter">
              <div className="space-y-4">
                <FieldGroup label="Date">
                  <Input
                    value={data.content.date}
                    onChange={(e) => setContent("date", e.target.value)}
                    placeholder="1 January 2026"
                  />
                </FieldGroup>
                <FieldGroup label="Subject">
                  <Input
                    value={data.content.subject}
                    onChange={(e) => setContent("subject", e.target.value)}
                    placeholder="Application for Frontend Developer"
                  />
                </FieldGroup>
                <FieldGroup label="Greeting">
                  <Input
                    value={data.content.greeting}
                    onChange={(e) => setContent("greeting", e.target.value)}
                    placeholder="Dear Sarah Williams,"
                  />
                </FieldGroup>
                <FieldGroup label="Opening paragraph">
                  <Textarea
                    value={data.content.opening}
                    onChange={(e) => setContent("opening", e.target.value)}
                    className="min-h-[90px]"
                  />
                </FieldGroup>
                <FieldGroup label="Body (separate paragraphs with a blank line)">
                  <Textarea
                    value={data.content.body}
                    onChange={(e) => setContent("body", e.target.value)}
                    className="min-h-[160px]"
                  />
                </FieldGroup>
                <FieldGroup label="Closing paragraph">
                  <Textarea
                    value={data.content.closing}
                    onChange={(e) => setContent("closing", e.target.value)}
                    className="min-h-[90px]"
                  />
                </FieldGroup>
                <FieldGroup label="Signature (your name)">
                  <Input
                    value={data.content.signature}
                    onChange={(e) => setContent("signature", e.target.value)}
                    placeholder="Alex Mbarga"
                  />
                </FieldGroup>
              </div>
            </FormGroup>

            <FormGroup title="Your contact details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label="Name">
                  <Input
                    value={data.content.senderName}
                    onChange={(e) => setContent("senderName", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label="Title">
                  <Input
                    value={data.content.senderTitle}
                    onChange={(e) => setContent("senderTitle", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label="Email">
                  <Input
                    value={data.content.senderEmail}
                    onChange={(e) => setContent("senderEmail", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label="Phone">
                  <Input
                    value={data.content.senderPhone}
                    onChange={(e) => setContent("senderPhone", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label="Location" className="sm:col-span-2">
                  <Input
                    value={data.content.senderLocation}
                    onChange={(e) => setContent("senderLocation", e.target.value)}
                  />
                </FieldGroup>
              </div>
            </FormGroup>
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
                <CoverLetterDocument data={data} />
              </A4Frame>
            </div>
          </div>
        </aside>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        labelledBy="cl-delete-title"
      >
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2 id="cl-delete-title" className="font-display text-xl font-bold text-ink">
          Delete this cover letter?
        </h2>
        <p className="mt-2 text-ink-muted">
          <span className="font-medium text-ink">{title}</span> will be
          permanently deleted. This action cannot be undone.
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
              "Delete"
            )}
          </Button>
        </div>
      </Modal>

      <ExportModal
        status={exportStatus}
        error={exportError}
        onClose={() => setExportStatus("idle")}
        onRetry={handleDownload}
        noun="cover letter"
      />
    </div>
  );
}

function FormGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {title}
      </h2>
      {children}
    </div>
  );
}
