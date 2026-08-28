import { cn } from "@/lib/utils";
import { STATUS_META, type ApplicationStatus } from "@/lib/application-types";

/** Accessible status pill — uses a labelled dot + text, never color alone. */
export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.chip,
        meta.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}
