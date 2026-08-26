"use client";

import { AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Lock } from "lucide-react";
import { Input, Textarea, Select, FieldGroup } from "@/components/ui/Field";
import { RepeatableItem } from "./RepeatableItem";
import {
  SKILL_LEVELS,
  type PersonalInfo,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
} from "@/lib/cv-types";

/* ---------------- Personal ---------------- */

const PERSONAL_FIELDS: {
  label: string;
  k: keyof PersonalInfo;
  placeholder: string;
  type?: string;
  full?: boolean;
}[] = [
  { label: "Full name", k: "fullName", placeholder: "Alex Mbarga", full: true },
  {
    label: "Professional title",
    k: "title",
    placeholder: "Software Developer",
    full: true,
  },
  { label: "Email", k: "email", placeholder: "you@email.com", type: "email" },
  { label: "Phone", k: "phone", placeholder: "+237 6 78 90 12 34" },
  { label: "Location", k: "location", placeholder: "Douala, Cameroon" },
  { label: "LinkedIn", k: "linkedin", placeholder: "linkedin.com/in/username" },
  {
    label: "Portfolio / Website",
    k: "portfolio",
    placeholder: "yoursite.dev",
    full: true,
  },
];

export function PersonalSection({
  personal,
  onChange,
}: {
  personal: PersonalInfo;
  onChange: (key: keyof PersonalInfo, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {PERSONAL_FIELDS.map((f) => (
        <FieldGroup
          key={f.k}
          label={f.label}
          className={f.full ? "sm:col-span-2" : undefined}
        >
          <Input
            type={f.type ?? "text"}
            value={personal[f.k]}
            onChange={(e) => onChange(f.k, e.target.value)}
            placeholder={f.placeholder}
          />
        </FieldGroup>
      ))}
    </div>
  );
}

/* ---------------- Summary ---------------- */

export function SummarySection({
  summary,
  onChange,
}: {
  summary: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldGroup label="Professional summary">
        <Textarea
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write 2–3 sentences about your strengths, focus and what you bring to a role."
          className="min-h-[140px]"
        />
      </FieldGroup>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
        <Sparkles className="h-3.5 w-3.5 text-brand-500" />
        Tip: lead with your role and years of experience, then your key strengths.
      </p>
    </div>
  );
}

/* ---------------- Experience ---------------- */

export function ExperienceSection({
  items,
  add,
  update,
  remove,
}: {
  items: ExperienceItem[];
  add: () => void;
  update: (id: string, key: keyof ExperienceItem, value: string) => void;
  remove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {items.map((e) => (
          <RepeatableItem
            key={e.id}
            title={e.position || "New role"}
            subtitle={e.company || "Company"}
            onRemove={() => remove(e.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Job title">
                <Input
                  value={e.position}
                  onChange={(ev) => update(e.id, "position", ev.target.value)}
                  placeholder="Software Developer"
                />
              </FieldGroup>
              <FieldGroup label="Company">
                <Input
                  value={e.company}
                  onChange={(ev) => update(e.id, "company", ev.target.value)}
                  placeholder="Tech Company"
                />
              </FieldGroup>
              <FieldGroup label="Location" className="sm:col-span-2">
                <Input
                  value={e.location}
                  onChange={(ev) => update(e.id, "location", ev.target.value)}
                  placeholder="Douala, Cameroon"
                />
              </FieldGroup>
              <FieldGroup label="Start date">
                <Input
                  value={e.startDate}
                  onChange={(ev) => update(e.id, "startDate", ev.target.value)}
                  placeholder="Jan 2023"
                />
              </FieldGroup>
              <FieldGroup label="End date">
                <Input
                  value={e.endDate}
                  onChange={(ev) => update(e.id, "endDate", ev.target.value)}
                  placeholder="Present"
                />
              </FieldGroup>
              <FieldGroup label="Description" className="sm:col-span-2">
                <Textarea
                  value={e.description}
                  onChange={(ev) => update(e.id, "description", ev.target.value)}
                  placeholder="What you did and the impact you made."
                />
              </FieldGroup>
            </div>
          </RepeatableItem>
        ))}
      </AnimatePresence>

      <AddButton label="Add experience" onClick={add} />
    </div>
  );
}

/* ---------------- Education ---------------- */

export function EducationSection({
  items,
  add,
  update,
  remove,
}: {
  items: EducationItem[];
  add: () => void;
  update: (id: string, key: keyof EducationItem, value: string) => void;
  remove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {items.map((ed) => (
          <RepeatableItem
            key={ed.id}
            title={ed.degree || "New qualification"}
            subtitle={ed.institution || "Institution"}
            onRemove={() => remove(ed.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Institution" className="sm:col-span-2">
                <Input
                  value={ed.institution}
                  onChange={(ev) => update(ed.id, "institution", ev.target.value)}
                  placeholder="University of Douala"
                />
              </FieldGroup>
              <FieldGroup label="Degree">
                <Input
                  value={ed.degree}
                  onChange={(ev) => update(ed.id, "degree", ev.target.value)}
                  placeholder="Bachelor of Technology"
                />
              </FieldGroup>
              <FieldGroup label="Field of study">
                <Input
                  value={ed.field}
                  onChange={(ev) => update(ed.id, "field", ev.target.value)}
                  placeholder="Computer Engineering"
                />
              </FieldGroup>
              <FieldGroup label="Start date">
                <Input
                  value={ed.startDate}
                  onChange={(ev) => update(ed.id, "startDate", ev.target.value)}
                  placeholder="2019"
                />
              </FieldGroup>
              <FieldGroup label="End date">
                <Input
                  value={ed.endDate}
                  onChange={(ev) => update(ed.id, "endDate", ev.target.value)}
                  placeholder="2022"
                />
              </FieldGroup>
            </div>
          </RepeatableItem>
        ))}
      </AnimatePresence>

      <AddButton label="Add education" onClick={add} />
    </div>
  );
}

/* ---------------- Skills ---------------- */

export function SkillsSection({
  items,
  add,
  update,
  remove,
}: {
  items: SkillItem[];
  add: () => void;
  update: (id: string, key: keyof SkillItem, value: string) => void;
  remove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {items.map((s) => (
          <RepeatableItem
            key={s.id}
            title={s.name || "New skill"}
            subtitle={s.level}
            onRemove={() => remove(s.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Skill name">
                <Input
                  value={s.name}
                  onChange={(ev) => update(s.id, "name", ev.target.value)}
                  placeholder="JavaScript"
                />
              </FieldGroup>
              <FieldGroup label="Level">
                <Select
                  value={s.level}
                  onChange={(ev) => update(s.id, "level", ev.target.value)}
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>
          </RepeatableItem>
        ))}
      </AnimatePresence>

      <AddButton label="Add skill" onClick={add} />
    </div>
  );
}

/* ---------------- Upcoming ---------------- */

export function UpcomingSection({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-6 py-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-canvas text-ink-muted">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">
        {title} — coming soon
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
        This section is on the way. In the meantime, the essentials above are all
        you need for a strong, complete CV.
      </p>
    </div>
  );
}

/* ---------------- Shared add button ---------------- */

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface px-4 py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-brand-500 hover:text-brand-700"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}
