"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
];

export function RangeTabs({ basePath, range }: { basePath: string; range: string }) {
  const router = useRouter();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => router.push(`${basePath}?range=${r.value}`)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            range === r.value ? "bg-ink text-canvas" : "text-ink-soft hover:text-ink"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
