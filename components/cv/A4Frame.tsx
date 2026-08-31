"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const A4_WIDTH = 794; // px @ ~96dpi

/**
 * Renders a fixed-width (A4) document and scales it down to fit its container
 * width, so the CV preview looks like a real page at any size.
 */
export function A4Frame({
  children,
  className,
  pad = true,
}: {
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState<number>();

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;
    const available = wrap.clientWidth;
    const next = Math.min(available / A4_WIDTH, 1);
    setScale(next);
    setHeight(content.offsetHeight * next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full", className)}
      style={{ height }}
    >
      <div
        ref={contentRef}
        className={cn(
          "absolute left-0 top-0 origin-top-left overflow-hidden bg-white",
          pad && "",
          "shadow-paper ring-1 ring-black/[0.04]"
        )}
        style={{
          width: A4_WIDTH,
          minHeight: 1123,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
