import type {
  CVData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
} from "@/lib/cv-types";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const dateRange = (start: string, end: string, current?: boolean) =>
  [start, current ? "Present" : end].filter(Boolean).join(" – ");

function hasAnyContact(p: CVData["personal"]) {
  return [p.email, p.phone, p.location, p.linkedin, p.portfolio].some((x) =>
    x?.trim()
  );
}

interface Flags {
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  languages: boolean;
  anyBody: boolean;
}

function flags(data: CVData): Flags {
  const f = {
    summary: Boolean(data.summary?.trim()),
    experience: data.experiences.length > 0,
    education: data.educations.length > 0,
    skills: data.skills.length > 0,
    projects: data.projects.length > 0,
    certifications: data.certifications.length > 0,
    languages: data.languages.length > 0,
  };
  return { ...f, anyBody: Object.values(f).some(Boolean) };
}

function EmptyHint() {
  return (
    <div className="px-[56px] py-10 text-[12.5px] text-neutral-300">
      Start filling in the form and your CV will take shape here.
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CLASSIC — traditional, serif, centered                              */
/* ------------------------------------------------------------------ */

function Classic({ data }: { data: CVData }) {
  const { personal: p } = data;
  const f = flags(data);
  const name = p.fullName.trim();
  const title = p.title.trim();

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 border-b border-neutral-300 pb-1.5 text-[15px] font-bold uppercase tracking-[0.18em] text-neutral-800">
      {children}
    </h2>
  );

  return (
    <div className="font-serifcv px-[60px] py-[56px] text-neutral-800">
      <header className="text-center">
        <h1
          className={`text-[36px] font-bold leading-tight tracking-[0.02em] ${
            name ? "text-neutral-900" : "text-neutral-300"
          }`}
        >
          {name || "Your Name"}
        </h1>
        {(title || !name) && (
          <p
            className={`mt-1.5 text-[16px] tracking-wide ${
              title ? "text-neutral-600" : "text-neutral-300"
            }`}
          >
            {title || "Professional Title"}
          </p>
        )}
        {hasAnyContact(p) && (
          <p className="mx-auto mt-3 max-w-[92%] text-[12.5px] leading-relaxed text-neutral-600">
            {[p.location, p.phone, p.email, p.linkedin, p.portfolio]
              .filter((x) => x?.trim())
              .join("   •   ")}
          </p>
        )}
      </header>

      {f.anyBody && <hr className="my-6 border-neutral-800" />}

      {f.summary && (
        <section className="mb-6">
          <SectionTitle>Profile</SectionTitle>
          <p className="text-[13px] leading-[1.7] text-neutral-700">
            {data.summary}
          </p>
        </section>
      )}

      {f.experience && (
        <section className="mb-6">
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {data.experiences.map((e) => (
              <ClassicExp key={e.id} e={e} />
            ))}
          </div>
        </section>
      )}

      {f.education && (
        <section className="mb-6">
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-3">
            {data.educations.map((ed) => (
              <div key={ed.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[13.5px] font-semibold text-neutral-900">
                    {ed.degree || "Degree"}
                    {ed.field ? `, ${ed.field}` : ""}
                  </p>
                  <span className="shrink-0 text-[12px] text-neutral-500">
                    {dateRange(ed.startDate, ed.endDate)}
                  </span>
                </div>
                <p className="text-[12.5px] italic text-neutral-600">
                  {ed.institution || "Institution"}
                </p>
                {ed.description?.trim() && (
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-neutral-700">
                    {ed.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {f.projects && (
        <section className="mb-6">
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-3">
            {data.projects.map((pr) => (
              <ClassicProject key={pr.id} pr={pr} />
            ))}
          </div>
        </section>
      )}

      {f.skills && (
        <section className="mb-6">
          <SectionTitle>Skills</SectionTitle>
          <p className="text-[13px] leading-[1.8] text-neutral-700">
            {data.skills.map((s) => s.name).filter(Boolean).join("  ·  ")}
          </p>
        </section>
      )}

      {f.certifications && (
        <section className="mb-6">
          <SectionTitle>Certifications</SectionTitle>
          <div className="space-y-2">
            {data.certifications.map((c) => (
              <div key={c.id} className="flex items-baseline justify-between gap-4">
                <p className="text-[13px] text-neutral-800">
                  <span className="font-semibold">{c.name || "Certification"}</span>
                  {c.issuer ? ` — ${c.issuer}` : ""}
                </p>
                <span className="shrink-0 text-[12px] text-neutral-500">
                  {c.date}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {f.languages && (
        <section>
          <SectionTitle>Languages</SectionTitle>
          <p className="text-[13px] leading-[1.8] text-neutral-700">
            {data.languages
              .map((l) => (l.name ? `${l.name} (${l.level})` : ""))
              .filter(Boolean)
              .join("   ·   ")}
          </p>
        </section>
      )}

      {!f.anyBody && !hasAnyContact(p) && <EmptyHint />}
    </div>
  );
}

function ClassicExp({ e }: { e: ExperienceItem }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[13.5px] font-bold text-neutral-900">
          {e.position || "Position"}
        </p>
        <span className="shrink-0 text-[12px] text-neutral-500">
          {dateRange(e.startDate, e.endDate, e.current)}
        </span>
      </div>
      <p className="text-[12.5px] italic text-neutral-600">
        {[e.company, e.location].filter(Boolean).join(", ") || "Company"}
      </p>
      {e.description?.trim() && (
        <p className="mt-1 text-[12.5px] leading-[1.65] text-neutral-700">
          {e.description}
        </p>
      )}
    </div>
  );
}

function ClassicProject({ pr }: { pr: ProjectItem }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[13.5px] font-bold text-neutral-900">
          {pr.name || "Project"}
        </p>
        {pr.url?.trim() && (
          <span className="shrink-0 text-[11.5px] text-neutral-500">{pr.url}</span>
        )}
      </div>
      {pr.description?.trim() && (
        <p className="mt-0.5 text-[12.5px] leading-[1.6] text-neutral-700">
          {pr.description}
        </p>
      )}
      {pr.technologies.length > 0 && (
        <p className="mt-0.5 text-[12px] italic text-neutral-500">
          {pr.technologies.join(", ")}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MODERN — sans, brand accent, sidebar                                */
/* ------------------------------------------------------------------ */

function Modern({ data }: { data: CVData }) {
  const { personal: p } = data;
  const f = flags(data);
  const name = p.fullName.trim();
  const title = p.title.trim();

  const contacts = [
    { icon: Mail, v: p.email },
    { icon: Phone, v: p.phone },
    { icon: MapPin, v: p.location },
    { icon: Linkedin, v: p.linkedin },
    { icon: Globe, v: p.portfolio },
  ].filter((c) => c.v?.trim());

  const sidebar = f.skills || f.languages || f.certifications;

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.15em] text-[#0B573C]">
      <span className="h-[7px] w-[7px] rounded-sm bg-[#0E6B49]" />
      {children}
    </h2>
  );

  const SideHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.15em] text-[#0B573C]">
      {children}
    </h2>
  );

  return (
    <div className="font-sans text-neutral-800">
      <header className="bg-[#0A4531] px-[52px] py-[40px] text-white">
        <h1
          className={`text-[34px] font-extrabold leading-none tracking-tight ${
            name ? "text-white" : "text-white/40"
          }`}
        >
          {name || "Your Name"}
        </h1>
        <p
          className={`mt-2 text-[15px] font-medium ${
            title ? "text-[#A9D2BF]" : "text-white/40"
          }`}
        >
          {title || "Professional Title"}
        </p>
        {contacts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
            {contacts.map((c, i) => {
              const Icon = c.icon;
              return (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-[11.5px] text-white/85"
                >
                  <Icon className="h-3.5 w-3.5 text-[#74B79A]" strokeWidth={2} />
                  {c.v}
                </span>
              );
            })}
          </div>
        )}
      </header>

      <div className={sidebar ? "grid grid-cols-[1fr_260px]" : ""}>
        <div className="px-[40px] py-[36px]">
          {f.summary && (
            <section className="mb-6">
              <Heading>Summary</Heading>
              <p className="text-[12.5px] leading-[1.7] text-neutral-700">
                {data.summary}
              </p>
            </section>
          )}

          {f.experience && (
            <section className="mb-6">
              <Heading>Experience</Heading>
              <div className="space-y-4">
                {data.experiences.map((e) => (
                  <ModernExp key={e.id} e={e} />
                ))}
              </div>
            </section>
          )}

          {f.education && (
            <section className="mb-6">
              <Heading>Education</Heading>
              <div className="space-y-3">
                {data.educations.map((ed) => (
                  <ModernEdu key={ed.id} ed={ed} />
                ))}
              </div>
            </section>
          )}

          {f.projects && (
            <section>
              <Heading>Projects</Heading>
              <div className="space-y-3">
                {data.projects.map((pr) => (
                  <div key={pr.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13.5px] font-bold text-neutral-900">
                        {pr.name || "Project"}
                      </p>
                      {pr.url?.trim() && (
                        <span className="shrink-0 text-[11px] text-[#0E6B49]">
                          {pr.url}
                        </span>
                      )}
                    </div>
                    {pr.description?.trim() && (
                      <p className="text-[12px] leading-[1.6] text-neutral-600">
                        {pr.description}
                      </p>
                    )}
                    {pr.technologies.length > 0 && (
                      <p className="mt-0.5 text-[11.5px] font-medium text-[#0E6B49]">
                        {pr.technologies.join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {sidebar && (
          <aside className="border-l border-neutral-200 bg-[#F6F8F6] px-[26px] py-[36px]">
            {f.skills && (
              <section className="mb-6">
                <SideHeading>Skills</SideHeading>
                <ul className="space-y-2.5">
                  {data.skills.map((s) => (
                    <ModernSkill key={s.id} name={s.name} level={s.level} />
                  ))}
                </ul>
              </section>
            )}
            {f.languages && (
              <section className="mb-6">
                <SideHeading>Languages</SideHeading>
                <ul className="space-y-1.5">
                  {data.languages.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-baseline justify-between gap-2 text-[12px]"
                    >
                      <span className="font-semibold text-neutral-800">
                        {l.name || "Language"}
                      </span>
                      <span className="text-[10.5px] text-neutral-500">
                        {l.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {f.certifications && (
              <section>
                <SideHeading>Certifications</SideHeading>
                <ul className="space-y-2.5">
                  {data.certifications.map((c) => (
                    <li key={c.id}>
                      <p className="text-[12px] font-semibold text-neutral-800">
                        {c.name || "Certification"}
                      </p>
                      <p className="text-[10.5px] text-neutral-500">
                        {[c.issuer, c.date].filter(Boolean).join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        )}
      </div>

      {!f.anyBody && contacts.length === 0 && <EmptyHint />}
    </div>
  );
}

function ModernExp({ e }: { e: ExperienceItem }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13.5px] font-bold text-neutral-900">
          {e.position || "Position"}
        </p>
        <span className="shrink-0 text-[11px] font-medium text-neutral-500">
          {dateRange(e.startDate, e.endDate, e.current)}
        </span>
      </div>
      <p className="text-[12.5px] font-medium text-[#0E6B49]">
        {[e.company, e.location].filter(Boolean).join(" · ") || "Company"}
      </p>
      {e.description?.trim() && (
        <p className="mt-1 text-[12px] leading-[1.6] text-neutral-600">
          {e.description}
        </p>
      )}
    </div>
  );
}

function ModernEdu({ ed }: { ed: EducationItem }) {
  return (
    <div>
      <p className="text-[13px] font-bold text-neutral-900">
        {ed.degree || "Degree"}
        {ed.field ? `, ${ed.field}` : ""}
      </p>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12.5px] font-medium text-[#0E6B49]">
          {ed.institution || "Institution"}
        </p>
        <span className="shrink-0 text-[11px] text-neutral-500">
          {dateRange(ed.startDate, ed.endDate)}
        </span>
      </div>
      {ed.description?.trim() && (
        <p className="mt-0.5 text-[12px] leading-[1.55] text-neutral-600">
          {ed.description}
        </p>
      )}
    </div>
  );
}

const LEVEL_PCT: Record<string, number> = {
  Beginner: 35,
  Intermediate: 60,
  Advanced: 82,
  Expert: 100,
};

function ModernSkill({ name, level }: { name: string; level: string }) {
  return (
    <li>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-neutral-800">
          {name || "Skill"}
        </span>
        <span className="text-[10px] text-neutral-500">{level}</span>
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-[#0E6B49]"
          style={{ width: `${LEVEL_PCT[level] ?? 60}%` }}
        />
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* MINIMAL — airy, understated                                         */
/* ------------------------------------------------------------------ */

function Minimal({ data }: { data: CVData }) {
  const { personal: p } = data;
  const f = flags(data);
  const name = p.fullName.trim();
  const title = p.title.trim();

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
      {children}
    </h2>
  );

  const TwoCol = ({
    date,
    children,
  }: {
    date: string;
    children: React.ReactNode;
  }) => (
    <div className="grid grid-cols-[110px_1fr] gap-5">
      <span className="pt-0.5 text-[11px] uppercase tracking-wide text-neutral-400">
        {date || "—"}
      </span>
      <div>{children}</div>
    </div>
  );

  return (
    <div className="font-sans px-[64px] py-[64px] text-neutral-800">
      <header className="mb-2">
        <h1
          className={`text-[32px] font-semibold leading-tight tracking-tight ${
            name ? "text-neutral-900" : "text-neutral-300"
          }`}
        >
          {name || "Your Name"}
        </h1>
        {(title || !name) && (
          <p
            className={`mt-1 text-[15px] ${
              title ? "text-neutral-500" : "text-neutral-300"
            }`}
          >
            {title || "Professional Title"}
          </p>
        )}
      </header>

      {hasAnyContact(p) && (
        <p className="text-[12px] leading-relaxed text-neutral-500">
          {[p.email, p.phone, p.location, p.linkedin, p.portfolio]
            .filter((x) => x?.trim())
            .join("   /   ")}
        </p>
      )}

      {f.anyBody && <div className="my-8 h-px w-full bg-neutral-200" />}

      {f.summary && (
        <section className="mb-9">
          <Heading>Profile</Heading>
          <p className="text-[13px] leading-[1.85] text-neutral-700">
            {data.summary}
          </p>
        </section>
      )}

      {f.experience && (
        <section className="mb-9">
          <Heading>Experience</Heading>
          <div className="space-y-6">
            {data.experiences.map((e) => (
              <TwoCol key={e.id} date={dateRange(e.startDate, e.endDate, e.current)}>
                <p className="text-[13.5px] font-semibold text-neutral-900">
                  {e.position || "Position"}
                </p>
                <p className="text-[12.5px] text-neutral-500">
                  {[e.company, e.location].filter(Boolean).join(", ") || "Company"}
                </p>
                {e.description?.trim() && (
                  <p className="mt-1.5 text-[12.5px] leading-[1.7] text-neutral-600">
                    {e.description}
                  </p>
                )}
              </TwoCol>
            ))}
          </div>
        </section>
      )}

      {f.education && (
        <section className="mb-9">
          <Heading>Education</Heading>
          <div className="space-y-4">
            {data.educations.map((ed) => (
              <TwoCol key={ed.id} date={dateRange(ed.startDate, ed.endDate)}>
                <p className="text-[13.5px] font-semibold text-neutral-900">
                  {ed.degree || "Degree"}
                  {ed.field ? `, ${ed.field}` : ""}
                </p>
                <p className="text-[12.5px] text-neutral-500">
                  {ed.institution || "Institution"}
                </p>
                {ed.description?.trim() && (
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-neutral-600">
                    {ed.description}
                  </p>
                )}
              </TwoCol>
            ))}
          </div>
        </section>
      )}

      {f.projects && (
        <section className="mb-9">
          <Heading>Projects</Heading>
          <div className="space-y-5">
            {data.projects.map((pr) => (
              <div key={pr.id} className="grid grid-cols-[110px_1fr] gap-5">
                <span className="pt-0.5 text-[11px] uppercase tracking-wide text-neutral-400">
                  {pr.technologies[0] ?? "—"}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-neutral-900">
                    {pr.name || "Project"}
                  </p>
                  {pr.description?.trim() && (
                    <p className="mt-1 text-[12.5px] leading-[1.7] text-neutral-600">
                      {pr.description}
                    </p>
                  )}
                  {pr.technologies.length > 0 && (
                    <p className="mt-1 text-[11.5px] text-neutral-400">
                      {pr.technologies.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {f.skills && (
        <section className="mb-9">
          <Heading>Skills</Heading>
          <div className="flex flex-wrap gap-x-2 gap-y-2">
            {data.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-neutral-200 px-3 py-1 text-[12px] text-neutral-700"
              >
                {s.name || "Skill"}
              </span>
            ))}
          </div>
        </section>
      )}

      {(f.certifications || f.languages) && (
        <section className="grid grid-cols-2 gap-8">
          {f.certifications && (
            <div>
              <Heading>Certifications</Heading>
              <ul className="space-y-2">
                {data.certifications.map((c) => (
                  <li key={c.id} className="text-[12.5px] text-neutral-700">
                    <span className="font-medium text-neutral-900">
                      {c.name || "Certification"}
                    </span>
                    {c.issuer ? ` · ${c.issuer}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {f.languages && (
            <div>
              <Heading>Languages</Heading>
              <ul className="space-y-2">
                {data.languages.map((l) => (
                  <li key={l.id} className="text-[12.5px] text-neutral-700">
                    <span className="font-medium text-neutral-900">
                      {l.name || "Language"}
                    </span>
                    <span className="text-neutral-400"> — {l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {!f.anyBody && !hasAnyContact(p) && <EmptyHint />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CVDocument({ data }: { data: CVData }) {
  switch (data.template) {
    case "classic":
      return <Classic data={data} />;
    case "minimal":
      return <Minimal data={data} />;
    case "modern":
    default:
      return <Modern data={data} />;
  }
}
