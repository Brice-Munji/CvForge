"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";
import { A4Frame } from "@/components/cv/A4Frame";
import { CVDocument } from "@/components/cv/CVDocument";
import { sampleCV, type TemplateId } from "@/lib/cv-types";

const templates: { id: TemplateId; name: string; note: string }[] = [
  { id: "classic", name: "Classic", note: "Timeless, serif, recruiter-friendly" },
  { id: "modern", name: "Modern", note: "Bold header with a skills sidebar" },
  { id: "minimal", name: "Minimal", note: "Clean, airy and understated" },
];

export function Templates() {
  return (
    <section id="templates" className="scroll-mt-24 bg-surface/60 py-20 lg:py-28">
      <div className="section-x">
        <SectionHeading
          eyebrow="Templates"
          title="Start with a CV that already looks professional."
          description="Every template is designed to be clean, readable and ATS-conscious — so your CV looks great to both people and software."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {templates.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-subtle transition-shadow duration-300 hover:shadow-lift"
              >
                {/* CV preview window */}
                <div className="relative overflow-hidden bg-canvas px-5 pt-6">
                  <div className="mx-auto w-full max-w-[300px] translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                    <A4Frame>
                      <CVDocument data={{ ...sampleCV, template: t.id }} />
                    </A4Frame>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-canvas to-transparent" />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">
                      {t.name}
                    </h3>
                    <p className="text-[0.82rem] text-ink-muted">{t.note}</p>
                  </div>
                  <a
                    href={`/builder/new?template=${t.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-ink transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white"
                  >
                    Use this template
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
