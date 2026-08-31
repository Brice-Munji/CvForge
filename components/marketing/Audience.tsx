import { GraduationCap, Briefcase, TrendingUp, Palette } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const groups = [
  {
    title: "For Students",
    body: "Turn your education, projects and skills into a professional CV.",
    icon: GraduationCap,
    lines: ["Education", "Projects", "Skills"],
  },
  {
    title: "For Graduates",
    body: "Present your qualifications confidently when entering the job market.",
    icon: Briefcase,
    lines: ["Degree", "Internships", "Achievements"],
  },
  {
    title: "For Professionals",
    body: "Create a polished CV for your next opportunity.",
    icon: TrendingUp,
    lines: ["Experience", "Impact", "Leadership"],
  },
  {
    title: "For Freelancers",
    body: "Showcase your experience, skills and projects professionally.",
    icon: Palette,
    lines: ["Portfolio", "Clients", "Services"],
  },
];

/** Subtle CV-snippet visual — abstract, not a stock photo. */
function Snippet({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-brand-100" />
        <div className="space-y-1">
          <div className="h-1.5 w-16 rounded-full bg-line-strong" />
          <div className="h-1.5 w-10 rounded-full bg-line" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {lines.map((l) => (
          <div key={l} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            <span className="text-[0.72rem] font-medium text-ink-soft">{l}</span>
            <div className="h-1 flex-1 rounded-full bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Audience() {
  return (
    <section className="py-20 lg:py-28">
      <div className="section-x">
        <SectionHeading
          eyebrow="Who it's for"
          title="Made for wherever you are in your journey."
          description="Whether you're just starting out or moving up, CVForge helps you put your best self forward."
        />

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <RevealItem
                key={g.title}
                className="flex flex-col rounded-2xl border border-line bg-surface p-6 transition-shadow duration-300 hover:shadow-card"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-canvas">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {g.title}
                  </h3>
                </div>
                <p className="mb-5 text-[0.95rem] leading-relaxed text-ink-muted">
                  {g.body}
                </p>
                <div className="mt-auto">
                  <Snippet lines={g.lines} />
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
