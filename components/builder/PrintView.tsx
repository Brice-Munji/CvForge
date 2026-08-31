"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { CVDocument } from "@/components/cv/CVDocument";
import type { CVData } from "@/lib/cv-types";

/**
 * A standalone, print-optimised view of just the CV. On print, all application
 * chrome is hidden and only the A4 document is sent to the printer.
 */
export function PrintView({ data }: { data: CVData }) {
  const router = useRouter();

  useEffect(() => {
    // Give fonts a moment to settle, then open the print dialog automatically.
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="print-screen min-h-screen bg-[#E9E7E1] py-8">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          .print-hide { display: none !important; }
          .print-screen { background: #ffffff !important; padding: 0 !important; }
          .print-sheet { box-shadow: none !important; margin: 0 !important; width: 210mm !important; }
        }
      `}</style>

      <div className="print-hide mx-auto mb-6 flex max-w-[794px] items-center justify-between px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-btn transition-colors hover:bg-brand-700"
        >
          <Printer className="h-4 w-4" /> Print CV
        </button>
      </div>

      <div
        className="print-sheet mx-auto bg-white shadow-paper"
        style={{ width: 794 }}
      >
        <CVDocument data={data} />
      </div>
    </div>
  );
}
