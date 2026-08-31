"use client";

import { Download, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExportStatus } from "./useExport";

export function DownloadButton({
  status,
  onClick,
  className,
  compact,
}: {
  status: ExportStatus;
  onClick: () => void;
  className?: string;
  compact?: boolean;
}) {
  const busy = status === "saving" || status === "preparing";
  const label =
    status === "saving"
      ? "Saving changes…"
      : status === "preparing"
      ? "Preparing PDF…"
      : status === "success"
      ? "PDF Ready"
      : "Download PDF";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label="Download CV as PDF"
      aria-busy={busy}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand-600 font-semibold text-white shadow-btn transition-all duration-200 hover:bg-brand-700 hover:shadow-lift disabled:cursor-default disabled:opacity-90 focus-visible:outline-none",
        compact ? "px-3.5 py-2 text-sm" : "px-4 py-2.5 text-[0.95rem]",
        className
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === "success" ? (
        <Check className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {compact && !busy ? "PDF" : label}
    </button>
  );
}
