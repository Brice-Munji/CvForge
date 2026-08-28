"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveStatus } from "@/components/builder/SaveIndicator";

/**
 * Generic debounced autosave with single-flight semantics and a flush() for
 * save-before-export. Reused across the cover letter builder and elsewhere.
 */
export function useAutosave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  delay = 900
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const latest = useRef(data);
  latest.current = data;
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const pending = useRef(false);
  const inFlight = useRef<Promise<void> | null>(null);
  const skipFirst = useRef(true);

  const run = useCallback(async () => {
    if (inFlight.current) {
      try {
        await inFlight.current;
      } catch {
        /* retry below */
      }
    }
    if (!pending.current) return;
    setStatus("saving");
    const p = saveFn(latest.current)
      .then(() => {
        pending.current = false;
        setStatus("saved");
      })
      .catch((e) => {
        setStatus("error");
        throw e;
      })
      .finally(() => {
        inFlight.current = null;
      });
    inFlight.current = p;
    await p;
  }, [saveFn]);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    pending.current = true;
    setStatus("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => run().catch(() => {}), delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [data, run, delay]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (pending.current || status === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    if (inFlight.current) {
      try {
        await inFlight.current;
      } catch {
        /* retry below */
      }
    }
    if (pending.current) await run();
  }, [run]);

  const retry = useCallback(() => run().catch(() => {}), [run]);

  return { status, flush, retry };
}
