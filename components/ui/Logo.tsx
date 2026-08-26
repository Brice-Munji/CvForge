import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 place-items-center rounded-[0.6rem] bg-brand-600 text-white shadow-btn",
        className
      )}
      aria-hidden
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        {/* Document + forge spark */}
        <path
          d="M6 3.2h7.4L19 8.6V19a1.8 1.8 0 0 1-1.8 1.8H6A1.8 1.8 0 0 1 4.2 19V5A1.8 1.8 0 0 1 6 3.2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M13 3.4V8.2a1 1 0 0 0 1 1h4.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="m11.4 11.3-2 3.1h2.2l-1 2.9 3.1-3.6h-2.1l1.1-2.4z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  href = "/",
  onClick,
}: {
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-3" />
      <span className="font-display text-[1.28rem] font-extrabold tracking-tight text-ink">
        CV<span className="text-brand-600">Forge</span>
      </span>
    </Link>
  );
}
