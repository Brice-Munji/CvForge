"use client";

import { CheckCircle2, AlertCircle, Download, RotateCw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ExportStatus } from "./useExport";

export function ExportModal({
  status,
  error,
  onClose,
  onRetry,
  noun = "CV",
}: {
  status: ExportStatus;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
  noun?: string;
}) {
  const open = status === "success" || status === "error";
  const isSuccess = status === "success";

  return (
    <Modal open={open} onClose={onClose} labelledBy="export-modal-title">
      <div
        className={`mb-3 grid h-12 w-12 place-items-center rounded-xl ${
          isSuccess ? "bg-brand-50 text-brand-600" : "bg-red-50 text-red-600"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <AlertCircle className="h-6 w-6" />
        )}
      </div>

      <h2 id="export-modal-title" className="font-display text-xl font-bold text-ink">
        {isSuccess ? `Your ${noun} is ready.` : "Couldn't generate PDF"}
      </h2>
      <p className="mt-2 text-ink-muted">
        {isSuccess
          ? `Your professional ${noun} has been downloaded. It's ready to send to employers, attach to emails, or print.`
          : error || "Something went wrong while creating your PDF. Please try again."}
      </p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {isSuccess ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Continue Editing
            </Button>
            <Button onClick={onRetry}>
              <Download className="h-4 w-4" />
              Download Again
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onRetry}>
              <RotateCw className="h-4 w-4" />
              Try Again
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
