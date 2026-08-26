import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <p className={cn("eyebrow", align === "center" && "justify-center")}>
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="mt-3 text-heading font-extrabold text-ink text-balance">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted text-pretty">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
