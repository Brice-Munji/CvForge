import { getAuthUser } from "@/lib/auth/server";
import { getSystemHealth } from "@/lib/server/admin";
import { listAuditLogs } from "@/lib/server/admin-manage";
import { relativeTime } from "@/lib/format";
import { Card, PageHeader, EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const [admin, health, audits] = await Promise.all([
    getAuthUser(),
    getSystemHealth(),
    listAuditLogs({ page, pageSize: 15 }),
  ]);

  return (
    <div>
      <PageHeader title="Settings" description="Admin profile, platform status and the action audit trail." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Admin profile">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label="Name" value={admin?.name || "—"} />
            <Field label="Email" value={admin?.email || "—"} />
            <Field label="Role" value={admin?.role || "—"} />
          </dl>
          <p className="mt-4 text-xs text-ink-faint">
            Admin roles are configured via the <code className="rounded bg-canvas px-1">ADMIN_EMAILS</code>{" "}
            environment variable or granted from a user&apos;s detail page.
          </p>
        </Card>

        <Card title="Platform">
          <HealthRow label="Database" ok={health.database.ok} value={health.database.label} />
          <HealthRow label="Authentication" ok={health.authentication.ok} value={health.authentication.label} />
          <HealthRow label="Payments" ok={health.payments.ok} value={health.payments.label} />
          <HealthRow label="AI" ok={health.ai.ok} value={health.ai.label} last />
          <p className="mt-4 text-xs text-ink-faint">
            Secrets (API keys, webhook secrets, database credentials) are never displayed here.
          </p>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Admin audit log">
          {audits.items.length === 0 ? (
            <EmptyState message="No admin actions recorded yet." />
          ) : (
            <ul className="divide-y divide-line">
              {audits.items.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 text-ink">
                    <span className="font-semibold">{a.admin}</span>{" "}
                    <span className="text-ink-muted">
                      {a.action.replace(/_/g, " ").toLowerCase()}
                    </span>{" "}
                    <span className="text-ink">{a.target}</span>
                    {typeof a.metadata.reason === "string" && a.metadata.reason && (
                      <span className="text-ink-muted"> — {String(a.metadata.reason)}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-ink-faint">{relativeTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
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

function HealthRow({ label, ok, value, last }: { label: string; ok: boolean; value: string; last?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-2.5", !last && "border-b border-line")}>
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-brand-500" : "bg-ink-faint")} />
        {value}
      </span>
    </div>
  );
}
