"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
  Mail,
  Copy,
  Check,
  Pencil,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, FieldGroup } from "@/components/ui/Field";
import { StatusSelect } from "@/components/app/StatusSelect";
import { useCopy } from "@/lib/use-copy";
import { generateApplicationEmail } from "@/lib/email/template";
import type { ApplicationDetail } from "@/lib/server/application-service";
import type { ApplicationStatus } from "@/lib/application-types";

export function ApplicationDetailClient({
  user,
  application,
  applicant,
}: {
  user: HeaderUser;
  application: ApplicationDetail;
  applicant: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [app, setApp] = useState(application);
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [statusBusy, setStatusBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Details editing
  const [editing, setEditing] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [form, setForm] = useState({
    companyName: app.companyName,
    jobTitle: app.jobTitle,
    jobLocation: app.jobLocation,
    applicationDate: app.applicationDate,
    companyWebsite: app.companyWebsite,
    jobUrl: app.jobUrl,
    salaryRange: app.salaryRange,
    recruiterName: app.recruiterName,
    recruiterEmail: app.recruiterEmail,
    jobDescription: app.jobDescription,
    notes: app.notes,
  });
  const setField = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Email
  const [email, setEmail] = useState(app.email);
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailDraft, setEmailDraft] = useState({
    subject: app.email?.subject ?? "",
    content: app.email?.content ?? "",
  });
  const [emailBusy, setEmailBusy] = useState(false);
  const { copied, copy } = useCopy();

  const changeStatus = async (s: ApplicationStatus) => {
    setStatusBusy(true);
    setError(null);
    const prev = status;
    setStatus(s);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setStatus(prev);
      setError("We couldn't update the status. Please try again.");
    } finally {
      setStatusBusy(false);
    }
  };

  const saveDetails = async () => {
    setSavingDetails(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setApp((a) => ({ ...a, ...form }));
      setEditing(false);
    } catch {
      setError("We couldn't save your changes. Please try again.");
    } finally {
      setSavingDetails(false);
    }
  };

  const generateEmail = async () => {
    setEmailBusy(true);
    setError(null);
    const gen = generateApplicationEmail({
      applicantName: applicant.name || user.name || "",
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      applicantEmail: applicant.email,
      applicantPhone: applicant.phone,
      hasCoverLetter: Boolean(app.coverLetterId),
    });
    try {
      const res = await fetch("/api/application-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          subject: gen.subject,
          content: gen.content,
        }),
      });
      if (!res.ok) throw new Error();
      const { email: created } = await res.json();
      setEmail(created);
      setEmailDraft({ subject: created.subject, content: created.content });
    } catch {
      setError("We couldn't generate the email. Please try again.");
    } finally {
      setEmailBusy(false);
    }
  };

  const saveEmail = async () => {
    if (!email) return;
    setEmailBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/application-emails/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailDraft),
      });
      if (!res.ok) throw new Error();
      setEmail({ ...email, ...emailDraft });
      setEmailEditing(false);
    } catch {
      setError("We couldn't save the email. Please try again.");
    } finally {
      setEmailBusy(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${app.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/applications");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} nav />
      <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> All applications
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-heading font-extrabold text-ink">
              {app.companyName || "Untitled company"}
            </h1>
            <p className="mt-1 text-lg text-ink-muted">
              {app.jobTitle || "—"}
              {app.jobLocation ? ` · ${app.jobLocation}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusSelect value={status} onChange={changeStatus} busy={statusBusy} align="right" />
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Attached documents */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <DocCard
            icon={<FileText className="h-5 w-5" />}
            label="CV used"
            title={app.cvTitle || "No CV attached"}
            href={app.cvId ? `/builder/${app.cvId}` : undefined}
            action="Open CV"
          />
          <DocCard
            icon={<Mail className="h-5 w-5" />}
            label="Cover letter used"
            title={app.coverLetterTitle || "No cover letter attached"}
            href={app.coverLetterId ? `/cover-letters/${app.coverLetterId}` : undefined}
            action="Open Cover Letter"
          />
        </div>

        {/* Details */}
        <section className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Application details
            </h2>
            {editing ? (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)} disabled={savingDetails}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveDetails} disabled={savingDetails}>
                  {savingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}
          </div>

          {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Company"><Input value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} /></FieldGroup>
              <FieldGroup label="Position"><Input value={form.jobTitle} onChange={(e) => setField("jobTitle", e.target.value)} /></FieldGroup>
              <FieldGroup label="Location"><Input value={form.jobLocation} onChange={(e) => setField("jobLocation", e.target.value)} /></FieldGroup>
              <FieldGroup label="Application date"><Input value={form.applicationDate} onChange={(e) => setField("applicationDate", e.target.value)} /></FieldGroup>
              <FieldGroup label="Company website"><Input value={form.companyWebsite} onChange={(e) => setField("companyWebsite", e.target.value)} /></FieldGroup>
              <FieldGroup label="Job posting URL"><Input value={form.jobUrl} onChange={(e) => setField("jobUrl", e.target.value)} /></FieldGroup>
              <FieldGroup label="Salary range"><Input value={form.salaryRange} onChange={(e) => setField("salaryRange", e.target.value)} /></FieldGroup>
              <FieldGroup label="Recruiter name"><Input value={form.recruiterName} onChange={(e) => setField("recruiterName", e.target.value)} /></FieldGroup>
              <FieldGroup label="Recruiter email" className="sm:col-span-2"><Input value={form.recruiterEmail} onChange={(e) => setField("recruiterEmail", e.target.value)} /></FieldGroup>
              <FieldGroup label="Job description" className="sm:col-span-2"><Textarea value={form.jobDescription} onChange={(e) => setField("jobDescription", e.target.value)} className="min-h-[120px]" /></FieldGroup>
              <FieldGroup label="Notes" className="sm:col-span-2"><Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} className="min-h-[80px]" /></FieldGroup>
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <Detail label="Application date" value={app.applicationDate} />
              <Detail label="Location" value={app.jobLocation} />
              <Detail label="Company website" value={app.companyWebsite} link />
              <Detail label="Job posting" value={app.jobUrl} link />
              <Detail label="Salary range" value={app.salaryRange} />
              <Detail label="Recruiter" value={[app.recruiterName, app.recruiterEmail].filter(Boolean).join(" · ")} />
              <div className="sm:col-span-2">
                <Detail label="Job description" value={app.jobDescription} block />
              </div>
              <div className="sm:col-span-2">
                <Detail label="Notes" value={app.notes} block />
              </div>
            </dl>
          )}
        </section>

        {/* Email */}
        <section className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Application email
            </h2>
            {email && !emailEditing && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copy(`${email.subject}\n\n${email.content}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-canvas transition-colors hover:bg-black"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailDraft({ subject: email.subject, content: email.content });
                    setEmailEditing(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            )}
          </div>

          {!email ? (
            <div className="rounded-xl border border-dashed border-line-strong bg-canvas/40 px-5 py-10 text-center">
              <p className="text-sm text-ink-muted">
                No email yet. Generate a professional application email you can
                copy and send.
              </p>
              <div className="mt-4 flex justify-center">
                <Button onClick={generateEmail} disabled={emailBusy}>
                  {emailBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate email
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : emailEditing ? (
            <div className="space-y-3">
              <FieldGroup label="Subject">
                <Input value={emailDraft.subject} onChange={(e) => setEmailDraft((d) => ({ ...d, subject: e.target.value }))} />
              </FieldGroup>
              <FieldGroup label="Body">
                <Textarea value={emailDraft.content} onChange={(e) => setEmailDraft((d) => ({ ...d, content: e.target.value }))} className="min-h-[220px]" />
              </FieldGroup>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEmailEditing(false)} disabled={emailBusy}>Cancel</Button>
                <Button size="sm" onClick={saveEmail} disabled={emailBusy}>
                  {emailBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save email"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-canvas/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Subject
              </p>
              <p className="mt-0.5 font-medium text-ink">{email.subject}</p>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {email.content}
              </div>
            </div>
          )}
        </section>

        {/* Danger */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Delete Application
          </button>
        </div>
      </main>

      <Modal
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        labelledBy="app-detail-delete"
      >
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2 id="app-detail-delete" className="font-display text-xl font-bold text-ink">
          Delete this application?
        </h2>
        <p className="mt-2 text-ink-muted">This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 shadow-none hover:bg-red-700">
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

function DocCard({
  icon,
  label,
  title,
  href,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  href?: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {label}
          </p>
          <p className="truncate text-sm font-medium text-ink">{title}</p>
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          {action} <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  block,
  link,
}: {
  label: string;
  value: string;
  block?: boolean;
  link?: boolean;
}) {
  const v = value?.trim();
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </dt>
      <dd
        className={
          block
            ? "mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft"
            : "mt-0.5 text-sm text-ink"
        }
      >
        {v ? (
          link ? (
            <a
              href={v.startsWith("http") ? v : `https://${v}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline underline-offset-2"
            >
              {v}
            </a>
          ) : (
            v
          )
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </dd>
    </div>
  );
}
