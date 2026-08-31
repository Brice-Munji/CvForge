import { cn } from "@/lib/utils";

/** Small, elegant PRO indicator. */
export function ProBadge({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-gradient-to-br from-amber-400 to-amber-500 font-bold uppercase tracking-wide text-amber-950 shadow-subtle",
        size === "xs" ? "px-1.5 py-0.5 text-[0.6rem]" : "px-2 py-0.5 text-[0.65rem]",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" aria-hidden>
        <path d="M12 2l2.9 6.3L22 9.2l-5 4.9 1.2 7L12 17.8 5.8 21l1.2-7-5-4.9 7.1-.9z" />
      </svg>
      Pro
    </span>
  );
}
