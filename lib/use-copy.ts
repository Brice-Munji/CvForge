"use client";

import { useCallback, useRef, useState } from "react";

/** Copy text to the clipboard with a transient "Copied!" state and a fallback. */
export function useCopy(resetMs = 1800) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback(
    async (text: string) => {
      setError(false);
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for insecure contexts / older browsers.
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          const ok = document.execCommand("copy");
          ta.remove();
          if (!ok) throw new Error("copy failed");
        }
        setCopied(true);
        if (t.current) clearTimeout(t.current);
        t.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        setError(true);
        if (t.current) clearTimeout(t.current);
        t.current = setTimeout(() => setError(false), resetMs);
        return false;
      }
    },
    [resetMs]
  );

  return { copied, error, copy };
}
