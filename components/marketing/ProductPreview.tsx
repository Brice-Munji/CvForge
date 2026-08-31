"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";
import { Input, Textarea, FieldGroup } from "@/components/ui/Field";
import { A4Frame } from "@/components/cv/A4Frame";
import { CVDocument } from "@/components/cv/CVDocument";
import { sampleCV, type CVData, type TemplateId } from "@/lib/cv-types";

const TEMPLATE_TABS: { id: TemplateId; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
];

export function ProductPreview() {
  const [data, setData] = useState<CVData>(sampleCV);

  const setPersonal = (key: keyof CVData["personal"], value: string) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [key]: value } }));

  return (
    <section className="section-x py-20 lg:py-28">
      <SectionHeading
        eyebrow="Live builder"
        title="See your CV come together as you build."
        description="Edit the fields on the left and watch the CV update instantly on the right. No refreshing, no guesswork — what you see is what you send."
      />

      <Reveal delay={0.1} className="mt-12">
        <div className="grid items-start gap-6 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:p-8">
          {/* Editable form */}
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {TEMPLATE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, template: t.id }))}
                  className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    data.template === t.id
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-line-strong text-ink-soft hover:border-ink/30"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label="Full name">
                  <Input
                    value={data.personal.fullName}
                    onChange={(e) => setPersonal("fullName", e.target.value)}
                    placeholder="Alex Mbarga"
                  />
                </FieldGroup>
                <FieldGroup label="Role">
                  <Input
                    value={data.personal.title}
                    onChange={(e) => setPersonal("title", e.target.value)}
                    placeholder="Software Developer"
                  />
                </FieldGroup>
              </div>

              <FieldGroup label="Location">
                <Input
                  value={data.personal.location}
                  onChange={(e) => setPersonal("location", e.target.value)}
                  placeholder="Douala, Cameroon"
                />
              </FieldGroup>

              <FieldGroup label="Professional summary">
                <Textarea
                  value={data.summary}
                  onChange={(e) =>
                    setData((d) => ({ ...d, summary: e.target.value }))
                  }
                  placeholder="A short summary of your strengths and focus."
                />
              </FieldGroup>

              <p className="rounded-lg bg-canvas px-3.5 py-3 text-[0.82rem] leading-relaxed text-ink-muted">
                This is a taste of the builder. The full editor lets you add
                experience, education, skills and more.
              </p>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-xl bg-canvas p-4 sm:p-6">
            <motion.div
              key={data.template}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <A4Frame className="mx-auto max-w-[420px] lg:max-w-none">
                <CVDocument data={data} />
              </A4Frame>
            </motion.div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
