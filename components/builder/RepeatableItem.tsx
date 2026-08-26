"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export function RepeatableItem({
  title,
  subtitle,
  onRemove,
  children,
}: {
  title: string;
  subtitle?: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-xl border border-line bg-surface p-4 sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
          {subtitle && (
            <p className="truncate text-xs text-ink-muted">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove ${title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {children}
    </motion.div>
  );
}
