import Link from "next/link";
import { Download } from "lucide-react";
import { listSubscriptions } from "@/lib/server/admin-manage";
import {
  PageHeader,
  Table,
  THead,
  TRow,
  TCell,
  Pagination,
  EmptyState,
} from "@/components/admin/ui";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { SubStatusBadge, PlanBadge } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: { page?: string; filter?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const filter = searchParams.filter ?? "all";
  const data = await listSubscriptions({ page, filter });

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description={`${data.total.toLocaleString("en-US")} subscriptions`}
        actions={
          <a
            href="/api/admin/export?type=subscriptions"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />
      <ListToolbar
        basePath="/admin/subscriptions"
        filter={filter}
        filters={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "canceled", label: "Canceled" },
          { value: "expired", label: "Expired" },
          { value: "past_due", label: "Past due" },
          { value: "admin", label: "Admin granted" },
        ]}
      />

      {data.items.length === 0 ? (
        <EmptyState message="No subscriptions yet." />
      ) : (
        <Table>
          <THead cols={["User", "Plan", "Status", "Provider", "Period end", "Created"]} />
          <tbody>
            {data.items.map((s) => (
              <TRow key={s.id}>
                <TCell>
                  <Link href={`/admin/users/${s.userId}`} className="font-medium text-ink hover:text-brand-700">
                    {s.owner}
                  </Link>
                </TCell>
                <TCell>
                  <PlanBadge tier="pro" grantType={s.grantType} />
                </TCell>
                <TCell><SubStatusBadge status={s.status} cancelAtPeriodEnd={s.cancelAtPeriodEnd} /></TCell>
                <TCell className="capitalize text-ink-muted">{s.provider}</TCell>
                <TCell className="text-ink-muted">{fmtDate(s.currentPeriodEnd)}</TCell>
                <TCell className="text-ink-muted">{fmtDate(s.createdAt)}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination page={data.page} pages={data.pages} total={data.total} basePath="/admin/subscriptions" params={{ filter }} />
    </div>
  );
}
