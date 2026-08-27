import { Document } from "@react-pdf/renderer";
import type { CVData } from "@/lib/cv-types";
import { pdfFlags } from "./pdf-utils";
import { ClassicPdf } from "./ClassicPdf";
import { ModernPdf } from "./ModernPdf";
import { MinimalPdf } from "./MinimalPdf";

/**
 * The single source that turns template-independent CV data into a PDF
 * document, choosing the renderer that matches the selected template.
 */
export function CvPdfDocument({
  data,
  authorName,
  title,
}: {
  data: CVData;
  authorName?: string;
  title?: string;
}) {
  const f = pdfFlags(data);
  const body =
    data.template === "modern" ? (
      <ModernPdf data={data} f={f} />
    ) : data.template === "minimal" ? (
      <MinimalPdf data={data} f={f} />
    ) : (
      <ClassicPdf data={data} f={f} />
    );

  return (
    <Document
      title={title || `${authorName || "CVForge"} CV`}
      author={authorName || "CVForge"}
      creator="CVForge"
      producer="CVForge"
    >
      {body}
    </Document>
  );
}
