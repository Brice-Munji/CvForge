"use client";

import { Check, Loader2, CloudOff, RotateCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export function SaveIndicator({
  status,
  onRetry,
}: {
  status: SaveStatus;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center text-xs font-medium">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-1.5"
        >
          {status === "saving" && (
            <span className="flex items-center gap-1.5 text-ink-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </span>
          )}
          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-brand-600">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          {status === "unsaved" && (
            <span className="flex items-center gap-1.5 text-ink-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
              Unsaved changes
            </span>
          )}
          {status === "error" && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1.5 text-red-600 hover:text-red-700"
            >
              <CloudOff className="h-3.5 w-3.5" />
              Unable to save
              <span className="ml-0.5 inline-flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-[0.7rem] font-semibold">
                <RotateCw className="h-3 w-3" />
                Retry
              </span>
            </button>
          )}
          {status === "idle" && <span className="text-ink-faint">All changes saved</span>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
