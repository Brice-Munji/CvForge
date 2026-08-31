import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-heading font-extrabold text-ink">{title}</h1>
        {description && <p className="mt-1 text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 transition-shadow duration-300 hover:shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{label}</p>
        {icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-ink">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-canvas/40 px-6 py-12 text-center text-sm text-ink-muted">
      {message}
    </div>
  );
}

/* ---------------- Table ---------------- */

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}
export function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {cols.map((c) => (
          <th key={c} className="px-4 py-3">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}
export function TRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-line last:border-0 transition-colors hover:bg-canvas/60">
      {children}
    </tr>
  );
}
export function TCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

/* ---------------- Pagination (server-rendered links) ---------------- */

export function Pagination({
  page,
  pages,
  total,
  basePath,
  params,
}: {
  page: number;
  pages: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const make = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "page") sp.set(k, v);
    });
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };
  if (pages <= 1) {
    return (
      <p className="mt-3 text-xs text-ink-muted">
        {total.toLocaleString("en-US")} total
      </p>
    );
  }
  return (
    <div className="mt-3 flex items-center justify-between">
      <p className="text-xs text-ink-muted">
        Page {page} of {pages} · {total.toLocaleString("en-US")} total
      </p>
      <div className="flex items-center gap-2">
        <PageLink href={page > 1 ? make(page - 1) : undefined} label="Previous" />
        <PageLink href={page < pages ? make(page + 1) : undefined} label="Next" />
      </div>
    </div>
  );
}

function PageLink({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return (
      <span className="cursor-not-allowed rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-faint">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
    >
      {label}
    </Link>
  );
}
