import Link from "next/link";
import { Download } from "lucide-react";
import { listUsers } from "@/lib/server/admin-manage";
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
import { RoleBadge, PlanBadge, AccountBadge } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; filter?: string; sort?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const q = searchParams.q ?? "";
  const filter = (searchParams.filter ?? "all") as "all" | "free" | "pro" | "admin";
  const sort = (searchParams.sort ?? "newest") as "newest" | "oldest" | "name";

  const data = await listUsers({ page, q, filter, sort });

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${data.total.toLocaleString("en-US")} accounts`}
        actions={
          <a
            href="/api/admin/export?type=users"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <ListToolbar
        basePath="/admin/users"
        q={q}
        filter={filter}
        filters={[
          { value: "all", label: "All" },
          { value: "free", label: "Free" },
          { value: "pro", label: "Pro" },
          { value: "admin", label: "Admin" },
        ]}
        sort={sort}
        sorts={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "name", label: "Name" },
        ]}
        searchPlaceholder="Search name or email…"
      />

      {data.items.length === 0 ? (
        <EmptyState message="No users match your search." />
      ) : (
        <Table>
          <THead cols={["User", "Role", "Plan", "Status", "Joined", ""]} />
          <tbody>
            {data.items.map((u) => (
              <TRow key={u.id}>
                <TCell>
                  <Link href={`/admin/users/${u.id}`} className="block">
                    <span className="font-semibold text-ink hover:text-brand-700">
                      {u.name || "—"}
                    </span>
                    <span className="block text-xs text-ink-muted">{u.email}</span>
                  </Link>
                </TCell>
                <TCell><RoleBadge role={u.role} /></TCell>
                <TCell><PlanBadge tier={u.tier} grantType={u.grantType} /></TCell>
                <TCell><AccountBadge disabled={u.disabled} /></TCell>
                <TCell className="text-ink-muted">{relativeTime(u.createdAt)}</TCell>
                <TCell className="text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
                  >
                    View
                  </Link>
                </TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination
        page={data.page}
        pages={data.pages}
        total={data.total}
        basePath="/admin/users"
        params={{ q, filter, sort }}
      />
    </div>
  );
}
