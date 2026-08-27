"use client";

/** Trigger a browser download for a Blob with the given filename. */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on next tick so the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
