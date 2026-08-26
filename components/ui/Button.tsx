import Link from "next/link";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ease-out select-none disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none active:translate-y-px whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-btn hover:bg-brand-700 hover:shadow-lift hover:-translate-y-0.5",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink/30 hover:-translate-y-0.5 hover:shadow-card",
  ghost: "text-ink-soft hover:text-ink hover:bg-ink/[0.04]",
  dark: "bg-ink text-canvas hover:bg-black hover:-translate-y-0.5 hover:shadow-lift",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2",
  md: "text-[0.95rem] px-5 py-2.5",
  lg: "text-base px-6 py-3.5",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonAsButton | ButtonAsLink
>(function Button(
  { variant = "primary", size = "md", className, children, ...props },
  ref
) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...(props as ButtonAsButton)}
    >
      {children}
    </button>
  );
});
