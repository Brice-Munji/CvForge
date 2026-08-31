import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import type { CVData } from "@/lib/cv-types";
import { CvPdfDocument } from "@/components/pdf/CvPdfDocument";

/** Render a CV to a real, text-selectable PDF buffer (server-side). */
export async function renderCvToBuffer(
  data: CVData,
  meta: { title?: string } = {}
): Promise<Buffer> {
  return renderToBuffer(
    <CvPdfDocument
      data={data}
      authorName={data.personal.fullName}
      title={meta.title}
    />
  );
}
