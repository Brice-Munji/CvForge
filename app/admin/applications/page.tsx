import { listApplications } from "@/lib/server/admin-manage";
import { relativeTime } from "@/lib/format";
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
import { StatusBadge } from "@/components/app/StatusBadge";
import { APPLICATION_STATUSES, isApplicationStatus } from "@/lib/application-types";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const q = searchParams.q ?? "";
  const status = searchParams.status ?? "all";
  const data = await listApplications({ page, q, status });

  return (
    <div>
      <PageHeader title="Applications" description={`${data.total.toLocaleString("en-US")} applications`} />
      <ListToolbar
        basePath="/admin/applications"
        q={q}
        filter={status}
        filterKey="status"
        filters={[
          { value: "all", label: "All" },
          ...APPLICATION_STATUSES.map((s) => ({ value: s, label: s })),
        ]}
        searchPlaceholder="Search company, position or email…"
      />

      {data.items.length === 0 ? (
        <EmptyState message="No applications match your search." />
      ) : (
        <Table>
          <THead cols={["Company", "Position", "Owner", "Status", "Updated"]} />
          <tbody>
            {data.items.map((a) => (
              <TRow key={a.id}>
                <TCell className="font-semibold text-ink">{a.companyName || "—"}</TCell>
                <TCell className="text-ink-soft">{a.jobTitle || "—"}</TCell>
                <TCell className="text-ink-muted">{a.owner}</TCell>
                <TCell>
                  {isApplicationStatus(a.status) ? (
                    <StatusBadge status={a.status} />
                  ) : (
                    a.status
                  )}
                </TCell>
                <TCell className="text-ink-muted">{relativeTime(a.updatedAt)}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination page={data.page} pages={data.pages} total={data.total} basePath="/admin/applications" params={{ q, status }} />
    </div>
  );
}
