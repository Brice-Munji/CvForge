import { listCVs } from "@/lib/server/admin-manage";
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

export const dynamic = "force-dynamic";

export default async function AdminCVsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const q = searchParams.q ?? "";
  const data = await listCVs({ page, q });

  return (
    <div>
      <PageHeader title="CVs" description={`${data.total.toLocaleString("en-US")} CVs created`} />
      <ListToolbar basePath="/admin/cvs" q={q} searchPlaceholder="Search CV title or user email…" />

      {data.items.length === 0 ? (
        <EmptyState message="No CVs match your search." />
      ) : (
        <Table>
          <THead cols={["CV", "Owner", "Template", "Downloads", "Updated"]} />
          <tbody>
            {data.items.map((c) => (
              <TRow key={c.id}>
                <TCell className="font-semibold text-ink">{c.title}</TCell>
                <TCell className="text-ink-muted">{c.owner}</TCell>
                <TCell className="capitalize text-ink-soft">{c.template}</TCell>
                <TCell className="text-ink-soft">{c.downloads}</TCell>
                <TCell className="text-ink-muted">{relativeTime(c.updatedAt)}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination page={data.page} pages={data.pages} total={data.total} basePath="/admin/cvs" params={{ q }} />
    </div>
  );
}
