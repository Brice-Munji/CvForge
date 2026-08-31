import Link from "next/link";
import { Download } from "lucide-react";
import { listPayments } from "@/lib/server/admin-manage";
import { getRevenueStats } from "@/lib/server/admin";
import { formatMoney } from "@/lib/plans";
import {
  PageHeader,
  Table,
  THead,
  TRow,
  TCell,
  Pagination,
  EmptyState,
  StatCard,
} from "@/components/admin/ui";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PaymentStatusBadge } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const q = searchParams.q ?? "";
  const status = searchParams.status ?? "all";
  const [data, rev] = await Promise.all([
    listPayments({ page, q, status }),
    getRevenueStats(),
  ]);

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Revenue counts verified successful payments only."
        actions={
          <a
            href="/api/admin/export?type=payments"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Verified revenue" value={formatMoney(rev.total)} />
        <StatCard label="Successful" value={rev.success} />
        <StatCard label="Failed" value={rev.failed} />
        <StatCard label="Pending" value={rev.pending} />
      </div>

      <ListToolbar
        basePath="/admin/payments"
        q={q}
        filter={status}
        filterKey="status"
        filters={[
          { value: "all", label: "All" },
          { value: "success", label: "Successful" },
          { value: "failed", label: "Failed" },
          { value: "pending", label: "Pending" },
        ]}
        searchPlaceholder="Search transaction ID or email…"
      />

      {data.items.length === 0 ? (
        <EmptyState message="No payments match your search." />
      ) : (
        <Table>
          <THead cols={["Transaction", "User", "Amount", "Plan", "Status", "Date"]} />
          <tbody>
            {data.items.map((p) => (
              <TRow key={p.id}>
                <TCell className="font-mono text-xs text-ink-muted">
                  {p.transactionId.slice(0, 18)}…
                </TCell>
                <TCell className="text-ink-soft">{p.owner}</TCell>
                <TCell className="font-semibold text-ink">{formatMoney(p.amount, p.currency)}</TCell>
                <TCell className="text-ink-muted">{p.plan}</TCell>
                <TCell><PaymentStatusBadge status={p.status} /></TCell>
                <TCell className="text-ink-muted">{fmtDate(p.createdAt)}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination page={data.page} pages={data.pages} total={data.total} basePath="/admin/payments" params={{ q, status }} />
    </div>
  );
}
