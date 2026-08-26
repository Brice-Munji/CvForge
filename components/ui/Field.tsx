import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const inputBase =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-faint transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputBase, className)} {...props} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputBase, "min-h-[92px] resize-y leading-relaxed", className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(inputBase, "cursor-pointer appearance-none pr-9", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236E6B65' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.85rem center",
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-[0.8rem] font-semibold text-ink-soft",
        className
      )}
    >
      {children}
    </label>
  );
}

export function FieldGroup({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
