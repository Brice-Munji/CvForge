"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Copy, Trash2, Loader2 } from "lucide-react";
import { A4Frame } from "@/components/cv/A4Frame";
import { CVDocument } from "@/components/cv/CVDocument";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CVListItem } from "@/lib/server/cv-service";

const TEMPLATE_LABEL: Record<string, string> = {
  classic: "Classic",
  modern: "Modern",
  minimal: "Minimal",
};

export function CVCard({
  item,
  onDuplicate,
  onDelete,
  duplicating,
}: {
  item: CVListItem;
  onDuplicate: (id: string) => void;
  onDelete: (item: CVListItem) => void;
  duplicating: boolean;
}) {
  const router = useRouter();
  const open = () => router.push(`/builder/${item.id}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-subtle transition-shadow duration-300 hover:shadow-card"
    >
      {/* Thumbnail */}
      <button
        type="button"
        onClick={open}
        className="relative block h-[190px] w-full overflow-hidden border-b border-line bg-[#F4F2EC] text-left"
        aria-label={`Open ${item.title}`}
      >
        <div className="pointer-events-none absolute inset-x-5 top-5">
          <A4Frame>
            <CVDocument data={item.data} />
          </A4Frame>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#F4F2EC] to-transparent" />
        <span className="absolute right-3 top-3 rounded-md bg-surface/90 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-muted shadow-subtle">
          {TEMPLATE_LABEL[item.template] ?? item.template}
        </span>
      </button>

      {/* Meta + actions */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <button type="button" onClick={open} className="min-w-0 text-left">
          <h3 className="truncate font-display text-[0.98rem] font-bold text-ink">
            {item.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-ink-muted">
            Updated {relativeTime(item.updatedAt)}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton label="Edit CV" onClick={open}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Duplicate CV"
            onClick={() => onDuplicate(item.id)}
            disabled={duplicating}
          >
            {duplicating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </IconButton>
          <IconButton
            label="Delete CV"
            onClick={() => onDelete(item)}
            danger
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </motion.div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors disabled:opacity-50",
        danger
          ? "hover:bg-red-50 hover:text-red-600"
          : "hover:bg-ink/[0.05] hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
