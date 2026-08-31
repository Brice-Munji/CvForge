"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

export function ListToolbar({
  basePath,
  q = "",
  filter,
  filters,
  filterKey = "filter",
  sort,
  sorts,
  searchPlaceholder = "Search…",
}: {
  basePath: string;
  q?: string;
  filter?: string;
  filters?: Option[];
  filterKey?: string;
  sort?: string;
  sorts?: Option[];
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  const go = (patch: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      q: query || undefined,
      [filterKey]: filter,
      sort,
      ...patch,
      page: undefined, // reset to page 1 on any change
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    const qs = sp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go({ q: query || undefined });
          }}
          className="relative max-w-sm flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="w-full rounded-xl border border-line-strong bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
        </form>

        {sorts && (
          <select
            value={sort}
            onChange={(e) => go({ sort: e.target.value })}
            aria-label="Sort"
            className="rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm font-medium text-ink"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {filters && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => go({ [filterKey]: f.value })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                (filter ?? filters[0].value) === f.value
                  ? "border-ink bg-ink text-canvas"
                  : "border-line-strong text-ink-soft hover:border-ink/30"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
