import { Eye, LayoutTemplate, SlidersHorizontal, Send } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const features = [
  {
    title: "Live Preview",
    body: "See exactly how your CV looks while you build it.",
    icon: Eye,
  },
  {
    title: "Professional Templates",
    body: "Choose from clean, modern CV designs.",
    icon: LayoutTemplate,
  },
  {
    title: "Easy Editing",
    body: "Update your information without fighting complicated formatting.",
    icon: SlidersHorizontal,
  },
  {
    title: "Job Application Ready",
    body: "Create a polished CV designed for real applications.",
    icon: Send,
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-surface/60 py-20 lg:py-28">
      <div className="section-x">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to make a stronger first impression."
          description="Thoughtful tools that keep the focus where it belongs — on your experience, not the software."
        />

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <RevealItem
                key={f.title}
                className="rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-card"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
                  {f.body}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
