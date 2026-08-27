/**
 * Build a safe, professional PDF filename from a CV's owner name.
 * "Alex Mbarga" -> "Alex_Mbarga_CV.pdf"; falls back to "CVForge_CV.pdf".
 */
export function cvFileName(fullName: string | undefined | null): string {
  const cleaned = (fullName ?? "")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // drop invalid filesystem chars
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60)
    .replace(/^_+|_+$/g, "");

  return cleaned ? `${cleaned}_CV.pdf` : "CVForge_CV.pdf";
}
