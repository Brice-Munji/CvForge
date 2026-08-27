"use client";

import { useCallback, useRef, useState } from "react";
import type { CVData } from "@/lib/cv-types";
import { validateForExport } from "@/lib/pdf/validate";
import { cvFileName } from "@/lib/pdf/filename";
import { triggerBlobDownload } from "@/lib/pdf/download";

export type ExportStatus =
  | "idle"
  | "saving"
  | "preparing"
  | "success"
  | "error";

const GENERIC_ERROR =
  "Something went wrong while creating your PDF. Please try again.";

/**
 * Orchestrates the "Download PDF" flow:
 * validate → flush pending autosave → request server PDF → download.
 * Keeps the user on the builder and prevents duplicate concurrent exports.
 */
export function useExport(opts: {
  cvId: string;
  getData: () => CVData;
  flushSave: () => Promise<void>;
}) {
  const { cvId, getData, flushSave } = opts;
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  const reset = useCallback(() => {
    if (busy.current) return;
    setStatus("idle");
    setError(null);
  }, []);

  const download = useCallback(async () => {
    if (busy.current) return;

    const data = getData();
    const validation = validateForExport(data);
    if (!validation.ok) {
      setError(validation.message || "Add some information before downloading.");
      setStatus("error");
      return;
    }

    busy.current = true;
    setError(null);
    try {
      // Persist the latest edits so the PDF is never generated from stale data.
      setStatus("saving");
      await flushSave();

      setStatus("preparing");
      const res = await fetch(`/api/cv/${cvId}/export`, { method: "POST" });
      if (!res.ok) {
        let msg = GENERIC_ERROR;
        try {
          const body = await res.json();
          if (body?.error) msg = body.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const blob = await res.blob();
      triggerBlobDownload(blob, cvFileName(data.personal.fullName));
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
      setStatus("error");
    } finally {
      busy.current = false;
    }
  }, [cvId, getData, flushSave]);

  return { status, error, download, reset };
}
