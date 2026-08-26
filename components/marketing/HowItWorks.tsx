import { LayoutTemplate, PencilLine, Download } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const steps = [
  {
    n: "01",
    title: "Choose a template",
    body: "Pick a design that fits the role you want. You can switch templates any time without losing your content.",
    icon: LayoutTemplate,
  },
  {
    n: "02",
    title: "Add your experience",
    body: "Fill in your details with simple, guided fields. No formatting headaches, no fighting with layouts.",
    icon: PencilLine,
  },
  {
    n: "03",
    title: "Preview and download",
    body: "Watch your CV update live as you type, then get a clean, send-ready document for your applications.",
    icon: Download,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 lg:py-28">
      <div className="section-x">
        <SectionHeading
          eyebrow="How it works"
          title="From blank page to job-ready CV."
          description="Three simple steps stand between you and a CV you're proud to send."
        />

        <div className="relative mt-14">
          {/* Connecting line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-[42px] hidden h-px bg-gradient-to-r from-line via-line-strong to-line lg:block" />

          <RevealGroup className="grid gap-8 lg:grid-cols-3 lg:gap-7" stagger={0.12}>
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <RevealItem key={s.n} className="relative">
                  <div className="flex items-center gap-4">
                    <div className="relative z-10 grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl border border-line bg-surface text-brand-600 shadow-subtle">
                      <Icon className="h-6 w-6" strokeWidth={1.9} />
                    </div>
                    <span className="font-display text-sm font-bold tracking-[0.2em] text-ink-faint">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{s.body}</p>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
