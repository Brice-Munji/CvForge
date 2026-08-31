import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAuthUser } from "@/lib/auth/server";
import { getUserDetail } from "@/lib/server/admin-manage";
import { formatMoney } from "@/lib/plans";
import { relativeTime } from "@/lib/format";
import { Card, StatCard } from "@/components/admin/ui";
import { RoleBadge, PlanBadge, AccountBadge, PaymentStatusBadge } from "@/components/admin/badges";
import { UserActions } from "@/components/admin/UserActions";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null) {
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

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await getAuthUser();
  const detail = await getUserDetail(params.id);
  if (!detail) notFound();

  const { profile, plan, subscription, counts, payments, audits } = detail;
  const isSelf = admin?.id === profile.id;

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> All users
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ink text-lg font-bold text-canvas">
            {initials(profile.name || profile.email) || "U"}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-heading font-extrabold text-ink">
            {profile.name || "Unnamed user"}
          </h1>
          <p className="text-ink-muted">{profile.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={profile.role} />
          <PlanBadge tier={plan.tier} grantType={plan.grantType} />
          <AccountBadge disabled={profile.disabled} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="CVs" value={counts.cvCount} />
            <StatCard label="Applications" value={counts.applicationCount} />
            <StatCard label="PDF exports" value={counts.pdfExports} />
            <StatCard label="Payments" value={payments.length} />
          </div>

          <Card title="Account">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <Field label="Registered" value={fmtDate(profile.createdAt)} />
              <Field label="Plan" value={plan.planLabel} />
              <Field
                label="Subscription status"
                value={subscription?.status ?? "—"}
              />
              <Field
                label="Pro source"
                value={
                  subscription?.grantType === "admin"
                    ? "Admin-granted"
                    : plan.tier === "pro"
                    ? "Paid"
                    : "—"
                }
              />
              <Field label="Current period end" value={fmtDate(subscription?.currentPeriodEnd ?? null)} />
              <Field label="Grant reason" value={subscription?.grantReason || "—"} />
            </dl>
          </Card>

          <Card title="Payment history">
            {payments.length === 0 ? (
              <p className="text-sm text-ink-muted">No payments.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-line last:border-0">
                        <td className="py-2.5 pr-4 text-ink-soft">{fmtDate(p.createdAt)}</td>
                        <td className="py-2.5 pr-4 text-ink">{formatMoney(p.amount, p.currency)}</td>
                        <td className="py-2.5"><PaymentStatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {audits.length > 0 && (
            <Card title="Admin actions on this user">
              <ul className="divide-y divide-line">
                {audits.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="text-ink">
                      <span className="font-semibold">{a.action.replace(/_/g, " ").toLowerCase()}</span>{" "}
                      <span className="text-ink-muted">by {a.admin}</span>
                      {typeof a.metadata.reason === "string" && a.metadata.reason && (
                        <span className="text-ink-muted"> — {String(a.metadata.reason)}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-ink-faint">{relativeTime(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div>
          <Card title="Manage">
            <UserActions
              userId={profile.id}
              role={profile.role}
              disabled={profile.disabled}
              tier={plan.tier}
              isSelf={isSelf}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}
