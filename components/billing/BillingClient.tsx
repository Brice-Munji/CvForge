"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Sparkles, Check } from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProBadge } from "./ProBadge";
import { getPlan, formatMoney } from "@/lib/plans";
import type { PlanContext } from "@/lib/server/billing";

interface PaymentRow {
  id: string;
  createdAt: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

const STATUS_LABEL: Record<string, string> = {
  SUCCESS: "Successful",
  PENDING: "Pending",
  FAILED: "Failed",
};

export function BillingClient({
  user,
  plan,
  payments,
}: {
  user: HeaderUser;
  plan: PlanContext;
  payments: PaymentRow[];
}) {
  const router = useRouter();
  const [sub, setSub] = useState(plan.subscription);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = plan.isPro;
  const planDef = getPlan(sub?.plan ?? "free");

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      if (!res.ok) throw new Error();
      setSub((s) => (s ? { ...s, cancelAtPeriodEnd: true } : s));
      setConfirmCancel(false);
    } catch {
      setError("We couldn't cancel your subscription. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const resume = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/resume", { method: "POST" });
      if (!res.ok) throw new Error();
      setSub((s) => (s ? { ...s, cancelAtPeriodEnd: false } : s));
    } catch {
      setError("We couldn't update your subscription. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const u = plan.usage;
  const lim = plan.limits;
  const usageRows = [
    { label: "CVs", used: u.cvCount, max: lim.maxCVs },
    { label: "PDF downloads (this month)", used: u.pdfExportCount, max: lim.maxPdfExportsPerPeriod },
    { label: "Applications", used: u.applicationCount, max: lim.maxApplications },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} nav />
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="eyebrow">Billing</p>
        <h1 className="mt-2 text-heading font-extrabold text-ink">
          Plan &amp; billing
        </h1>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Current plan */}
        <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
          {isPro ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-xl font-bold text-ink">
                    CVForge Pro
                  </h2>
                  <ProBadge />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {sub?.cancelAtPeriodEnd ? "Ending soon" : "Active"}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <Item label="Billing interval" value={planDef.billingInterval === "year" ? "Yearly" : "Monthly"} />
                <Item label="Amount" value={formatMoney(planDef.price, planDef.currency)} />
                <Item label="Started" value={fmtDate(sub?.startDate ?? null)} />
                <Item
                  label={sub?.cancelAtPeriodEnd ? "Access ends" : "Next billing date"}
                  value={fmtDate(sub?.currentPeriodEnd ?? null)}
                />
              </dl>

              {sub?.cancelAtPeriodEnd ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-900">
                    Your Pro subscription will end on{" "}
                    <strong>{fmtDate(sub?.currentPeriodEnd ?? null)}</strong>. You
                    keep Pro until then.
                  </p>
                  <div className="mt-3">
                    <Button size="sm" onClick={resume} disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Keep Pro"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/pricing" variant="secondary">
                    Manage Subscription
                  </Button>
                  <Button
                    onClick={() => setConfirmCancel(true)}
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-ink">
                You&apos;re on the Free plan.
              </h2>
              <p className="mt-2 text-ink-muted">
                Upgrade to CVForge Pro for unlimited CVs, all templates, cover
                letters and more.
              </p>
              <div className="mt-5">
                <Button href="/pricing">
                  <Sparkles className="h-4 w-4" /> Upgrade to Pro
                </Button>
              </div>
            </>
          )}
        </section>

        {/* Usage */}
        <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Usage
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {usageRows.map((r) => (
              <div key={r.label}>
                <p className="text-sm text-ink-muted">{r.label}</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">
                  {r.max === null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-brand-600" /> Unlimited
                    </span>
                  ) : (
                    `${r.used} / ${r.max}`
                  )}
                </p>
                {r.max !== null && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{
                        width: `${Math.min(100, Math.round((r.used / r.max) * 100))}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Payment history */}
        <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Payment history
          </h2>
          {payments.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No payments yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Plan</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-4 text-ink-soft">{fmtDate(p.createdAt)}</td>
                      <td className="py-2.5 pr-4 text-ink-soft">
                        {getPlan(p.plan).billingInterval === "year"
                          ? "Pro Yearly"
                          : "Pro Monthly"}
                      </td>
                      <td className="py-2.5 pr-4 text-ink">
                        {formatMoney(p.amount, p.currency)}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={
                            p.status === "SUCCESS"
                              ? "text-brand-700"
                              : p.status === "FAILED"
                              ? "text-red-600"
                              : "text-ink-muted"
                          }
                        >
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Modal
        open={confirmCancel}
        onClose={() => !busy && setConfirmCancel(false)}
        labelledBy="cancel-title"
      >
        <h2 id="cancel-title" className="font-display text-xl font-bold text-ink">
          Cancel your Pro subscription?
        </h2>
        <p className="mt-2 text-ink-muted">
          You&apos;ll keep Pro until{" "}
          <strong>{fmtDate(sub?.currentPeriodEnd ?? null)}</strong>. After that
          you&apos;ll move to the Free plan. Your CVs and applications are never
          deleted.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmCancel(false)} disabled={busy}>
            Keep Pro
          </Button>
          <Button
            onClick={cancel}
            disabled={busy}
            className="bg-red-600 shadow-none hover:bg-red-700"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel subscription"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}
