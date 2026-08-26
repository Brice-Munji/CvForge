import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const stats = [
  { value: "5 min", label: "Average build goal" },
  { value: "3+", label: "Professional templates" },
  { value: "PDF", label: "Ready to download" },
];

export function SocialProof() {
  return (
    <section className="border-y border-line bg-surface/60">
      <div className="section-x py-12 lg:py-14">
        <Reveal>
          <p className="text-center text-[0.95rem] font-medium text-ink-muted text-balance">
            Built for students, graduates and professionals ready for their next
            opportunity.
          </p>
        </Reveal>

        <RevealGroup className="mx-auto mt-9 grid max-w-2xl grid-cols-3 gap-4 sm:gap-8">
          {stats.map((s) => (
            <RevealItem
              key={s.label}
              className="flex flex-col items-center text-center"
            >
              <span className="font-display text-3xl font-extrabold tracking-tight text-brand-600 sm:text-4xl">
                {s.value}
              </span>
              <span className="mt-1.5 text-xs text-ink-muted sm:text-sm">
                {s.label}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
