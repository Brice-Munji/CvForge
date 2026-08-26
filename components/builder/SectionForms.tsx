"use client";

import { AnimatePresence } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { Input, Textarea, Select, FieldGroup } from "@/components/ui/Field";
import { RepeatableItem } from "./RepeatableItem";
import {
  SKILL_LEVELS,
  LANGUAGE_LEVELS,
  type PersonalInfo,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
  type ProjectItem,
  type CertificationItem,
  type LanguageItem,
} from "@/lib/cv-types";

/* ---------------- Personal ---------------- */

const PERSONAL_FIELDS: {
  label: string;
  k: keyof PersonalInfo;
  placeholder: string;
  type?: string;
  full?: boolean;
  required?: boolean;
}[] = [
  {
    label: "Full name",
    k: "fullName",
    placeholder: "Alex Mbarga",
    full: true,
    required: true,
  },
  {
    label: "Professional title",
    k: "title",
    placeholder: "Software Developer",
    full: true,
  },
  {
    label: "Email",
    k: "email",
    placeholder: "you@email.com",
    type: "email",
    required: true,
  },
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
  errors,
}: {
  personal: PersonalInfo;
  onChange: (key: keyof PersonalInfo, value: string) => void;
  errors: Partial<Record<keyof PersonalInfo, string>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {PERSONAL_FIELDS.map((f) => (
        <FieldGroup
          key={f.k}
          label={f.required ? `${f.label} *` : f.label}
          className={f.full ? "sm:col-span-2" : undefined}
        >
          <Input
            type={f.type ?? "text"}
            value={personal[f.k]}
            onChange={(e) => onChange(f.k, e.target.value)}
            placeholder={f.placeholder}
            aria-invalid={Boolean(errors[f.k])}
            className={errors[f.k] ? "border-red-400 focus:border-red-400 focus:ring-red-500/10" : ""}
          />
          {errors[f.k] && (
            <p className="mt-1 text-xs text-red-600">{errors[f.k]}</p>
          )}
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
  const len = summary.trim().length;
  const withinRange = len === 0 || (len >= 50 && len <= 500);
  return (
    <div>
      <FieldGroup label="Professional summary">
        <Textarea
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write a short professional summary about your strengths, focus and what you bring to a role."
          className="min-h-[150px]"
          maxLength={1000}
        />
      </FieldGroup>
      <div className="mt-2 flex items-center justify-between text-xs">
        <p className="flex items-center gap-1.5 text-ink-muted">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          Recommended 50–500 characters.
        </p>
        <span className={withinRange ? "text-ink-faint" : "text-accentwarm"}>
          {len} characters
        </span>
      </div>
    </div>
  );
}

/* ---------------- Experience ---------------- */

export function ExperienceSection({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: ExperienceItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ExperienceItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {items.map((e) => (
          <RepeatableItem
            key={e.id}
            title={e.position || "New role"}
            subtitle={e.company || "Company"}
            onRemove={() => onRemove(e.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Job title">
                <Input
                  value={e.position}
                  onChange={(ev) => onUpdate(e.id, { position: ev.target.value })}
                  placeholder="Software Developer"
                />
              </FieldGroup>
              <FieldGroup label="Company">
                <Input
                  value={e.company}
                  onChange={(ev) => onUpdate(e.id, { company: ev.target.value })}
                  placeholder="Tech Company"
                />
              </FieldGroup>
              <FieldGroup label="Location" className="sm:col-span-2">
                <Input
                  value={e.location}
                  onChange={(ev) => onUpdate(e.id, { location: ev.target.value })}
                  placeholder="Douala, Cameroon"
                />
              </FieldGroup>
              <FieldGroup label="Start date">
                <Input
                  value={e.startDate}
                  onChange={(ev) => onUpdate(e.id, { startDate: ev.target.value })}
                  placeholder="Jan 2023"
                />
              </FieldGroup>
              <FieldGroup label="End date">
                <Input
                  value={e.current ? "" : e.endDate}
                  onChange={(ev) => onUpdate(e.id, { endDate: ev.target.value })}
                  placeholder={e.current ? "Present" : "Dec 2024"}
                  disabled={e.current}
                  className={e.current ? "bg-canvas text-ink-faint" : ""}
                />
              </FieldGroup>
              <label className="flex cursor-pointer select-none items-center gap-2.5 sm:col-span-2">
                <Checkbox
                  checked={e.current}
                  onChange={(checked) =>
                    onUpdate(e.id, {
                      current: checked,
                      ...(checked ? { endDate: "" } : {}),
                    })
                  }
                />
                <span className="text-sm text-ink-soft">
                  I currently work here
                </span>
              </label>
              <FieldGroup label="Description" className="sm:col-span-2">
                <Textarea
                  value={e.description}
                  onChange={(ev) =>
                    onUpdate(e.id, { description: ev.target.value })
                  }
                  placeholder="What you did and the impact you made."
                />
              </FieldGroup>
            </div>
          </RepeatableItem>
        ))}
      </AnimatePresence>
      <AddButton label="Add experience" onClick={onAdd} />
    </div>
  );
}

/* ---------------- Education ---------------- */

export function EducationSection({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: EducationItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<EducationItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {items.map((ed) => (
          <RepeatableItem
            key={ed.id}
            title={ed.degree || "New qualification"}
            subtitle={ed.institution || "Institution"}
            onRemove={() => onRemove(ed.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Institution" className="sm:col-span-2">
                <Input
                  value={ed.institution}
                  onChange={(ev) =>
                    onUpdate(ed.id, { institution: ev.target.value })
                  }
                  placeholder="University of Douala"
                />
              </FieldGroup>
              <FieldGroup label="Degree">
                <Input
                  value={ed.degree}
                  onChange={(ev) => onUpdate(ed.id, { degree: ev.target.value })}
                  placeholder="Bachelor of Technology"
                />
              </FieldGroup>
              <FieldGroup label="Field of study">
                <Input
                  value={ed.field}
                  onChange={(ev) => onUpdate(ed.id, { field: ev.target.value })}
                  placeholder="Computer Engineering"
                />
              </FieldGroup>
              <FieldGroup label="Start date">
                <Input
                  value={ed.startDate}
                  onChange={(ev) =>
                    onUpdate(ed.id, { startDate: ev.target.value })
                  }
                  placeholder="2019"
                />
              </FieldGroup>
              <FieldGroup label="End date">
                <Input
                  value={ed.endDate}
                  onChange={(ev) => onUpdate(ed.id, { endDate: ev.target.value })}
                  placeholder="2022"
                />
              </FieldGroup>
              <FieldGroup label="Description" className="sm:col-span-2">
                <Textarea
                  value={ed.description}
                  onChange={(ev) =>
                    onUpdate(ed.id, { description: ev.target.value })
                  }
                  placeholder="Relevant coursework, honours or activities (optional)."
                />
              </FieldGroup>
            </div>
          </RepeatableItem>
        ))}
      </AnimatePresence>
      <AddButton label="Add education" onClick={onAdd} />
    </div>
  );
}

/* ---------------- Skills ---------------- */

export function SkillsSection({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: SkillItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<SkillItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {items.map((s) => (
          <RepeatableItem
            key={s.id}
            title={s.name || "New skill"}
            subtitle={s.level}
            onRemove={() => onRemove(s.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
              <FieldGroup label="Skill name">
                <Input
                  value={s.name}
                  onChange={(ev) => onUpdate(s.id, { name: ev.target.value })}
                  placeholder="JavaScript"
                />
              </FieldGroup>
              <FieldGroup label="Level">
                <Select
                  value={s.level}
                  onChange={(ev) =>
                    onUpdate(s.id, {
                      level: ev.target.value as SkillItem["level"],
                    })
                  }
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
      <AddButton label="Add skill" onClick={onAdd} />
    </div>
  );
}

/* ---------------- Projects ---------------- */

export function ProjectsSection({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: ProjectItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ProjectItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {items.map((p) => (
          <RepeatableItem
            key={p.id}
            title={p.name || "New project"}
            subtitle={p.technologies.filter(Boolean).join(", ") || "Technologies"}
            onRemove={() => onRemove(p.id)}
          >
            <div className="grid grid-cols-1 gap-4">
              <FieldGroup label="Project name">
                <Input
                  value={p.name}
                  onChange={(ev) => onUpdate(p.id, { name: ev.target.value })}
                  placeholder="TaskFlow"
                />
              </FieldGroup>
              <FieldGroup label="Description">
                <Textarea
                  value={p.description}
                  onChange={(ev) =>
                    onUpdate(p.id, { description: ev.target.value })
                  }
                  placeholder="What the project does and your role in it."
                />
              </FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label="Technologies (comma separated)">
                  <Input
                    value={p.technologies.join(", ")}
                    onChange={(ev) =>
                      onUpdate(p.id, {
                        technologies: ev.target.value
                          .split(",")
                          .map((t) => t.trimStart()),
                      })
                    }
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </FieldGroup>
                <FieldGroup label="Project URL">
                  <Input
                    value={p.url}
                    onChange={(ev) => onUpdate(p.id, { url: ev.target.value })}
                    placeholder="github.com/you/project"
                  />
                </FieldGroup>
              </div>
            </div>
          </RepeatableItem>
        ))}
      </AnimatePresence>
      <AddButton label="Add project" onClick={onAdd} />
    </div>
  );
}

/* ---------------- Certifications ---------------- */

export function CertificationsSection({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: CertificationItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<CertificationItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {items.map((c) => (
          <RepeatableItem
            key={c.id}
            title={c.name || "New certification"}
            subtitle={c.issuer || "Issuing organization"}
            onRemove={() => onRemove(c.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Certification name" className="sm:col-span-2">
                <Input
                  value={c.name}
                  onChange={(ev) => onUpdate(c.id, { name: ev.target.value })}
                  placeholder="Meta Front-End Developer"
                />
              </FieldGroup>
              <FieldGroup label="Issuing organization">
                <Input
                  value={c.issuer}
                  onChange={(ev) => onUpdate(c.id, { issuer: ev.target.value })}
                  placeholder="Coursera"
                />
              </FieldGroup>
              <FieldGroup label="Date">
                <Input
                  value={c.date}
                  onChange={(ev) => onUpdate(c.id, { date: ev.target.value })}
                  placeholder="2024"
                />
              </FieldGroup>
              <FieldGroup label="URL" className="sm:col-span-2">
                <Input
                  value={c.url}
                  onChange={(ev) => onUpdate(c.id, { url: ev.target.value })}
                  placeholder="credential.link/abc"
                />
              </FieldGroup>
            </div>
          </RepeatableItem>
        ))}
      </AnimatePresence>
      <AddButton label="Add certification" onClick={onAdd} />
    </div>
  );
}

/* ---------------- Languages ---------------- */

export function LanguagesSection({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: LanguageItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<LanguageItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {items.map((l) => (
          <RepeatableItem
            key={l.id}
            title={l.name || "New language"}
            subtitle={l.level}
            onRemove={() => onRemove(l.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px]">
              <FieldGroup label="Language">
                <Input
                  value={l.name}
                  onChange={(ev) => onUpdate(l.id, { name: ev.target.value })}
                  placeholder="French"
                />
              </FieldGroup>
              <FieldGroup label="Proficiency">
                <Select
                  value={l.level}
                  onChange={(ev) =>
                    onUpdate(l.id, {
                      level: ev.target.value as LanguageItem["level"],
                    })
                  }
                >
                  {LANGUAGE_LEVELS.map((lvl) => (
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
      <AddButton label="Add language" onClick={onAdd} />
    </div>
  );
}

/* ---------------- Shared ---------------- */

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
        checked
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-line-strong bg-surface"
      }`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2 5 8.5l4.5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

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
