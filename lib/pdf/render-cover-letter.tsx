import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import type { CoverLetterData } from "@/lib/coverletter-types";
import { CoverLetterPdfDocument } from "@/components/pdf/CoverLetterPdf";

export async function renderCoverLetterToBuffer(
  data: CoverLetterData
): Promise<Buffer> {
  return renderToBuffer(<CoverLetterPdfDocument data={data} />);
}
