import type { CVData, ExperienceItem, EducationItem, SkillItem } from "@/lib/cv-types";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

/** Shows real value, or muted placeholder text so the page never looks broken. */
function ph(value: string, placeholder: string) {
  const v = value?.trim();
  return {
    text: v || placeholder,
    empty: !v,
  };
}

function hasAnyContact(p: CVData["personal"]) {
  return [p.email, p.phone, p.location, p.linkedin, p.portfolio].some((x) =>
    x?.trim()
  );
}

/* ------------------------------------------------------------------ */
/* CLASSIC — traditional, serif, centered                              */
/* ------------------------------------------------------------------ */

function Classic({ data }: { data: CVData }) {
  const { personal: p } = data;
  const name = ph(p.fullName, "Your Name");
  const title = ph(p.title, "Professional Title");

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
            name.empty ? "text-neutral-300" : "text-neutral-900"
          }`}
        >
          {name.text}
        </h1>
        <p
          className={`mt-1.5 text-[16px] tracking-wide ${
            title.empty ? "text-neutral-300" : "text-neutral-600"
          }`}
        >
          {title.text}
        </p>
        {hasAnyContact(p) ? (
          <p className="mx-auto mt-3 max-w-[90%] text-[12.5px] leading-relaxed text-neutral-600">
            {[p.location, p.phone, p.email, p.linkedin, p.portfolio]
              .filter((x) => x?.trim())
              .join("   •   ")}
          </p>
        ) : (
          <p className="mt-3 text-[12.5px] text-neutral-300">
            email • phone • location
          </p>
        )}
      </header>

      <hr className="my-6 border-neutral-800" />

      {(data.summary?.trim() || true) && (
        <section className="mb-6">
          <SectionTitle>Profile</SectionTitle>
          <p
            className={`text-[13px] leading-[1.7] ${
              data.summary?.trim() ? "text-neutral-700" : "text-neutral-300"
            }`}
          >
            {data.summary?.trim() ||
              "A short professional summary highlighting your strengths, focus and what you bring to a role."}
          </p>
        </section>
      )}

      <section className="mb-6">
        <SectionTitle>Experience</SectionTitle>
        {data.experiences.length ? (
          <div className="space-y-4">
            {data.experiences.map((e) => (
              <ClassicExp key={e.id} e={e} />
            ))}
          </div>
        ) : (
          <p className="text-[13px] italic text-neutral-300">
            Your roles and achievements will appear here.
          </p>
        )}
      </section>

      <section className="mb-6">
        <SectionTitle>Education</SectionTitle>
        {data.educations.length ? (
          <div className="space-y-3">
            {data.educations.map((ed) => (
              <div key={ed.id} className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-[13.5px] font-semibold text-neutral-900">
                    {ed.degree || "Degree"}
                    {ed.field ? `, ${ed.field}` : ""}
                  </p>
                  <p className="text-[12.5px] italic text-neutral-600">
                    {ed.institution || "Institution"}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] text-neutral-500">
                  {[ed.startDate, ed.endDate].filter(Boolean).join(" – ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] italic text-neutral-300">
            Your education history will appear here.
          </p>
        )}
      </section>

      {data.skills.length > 0 && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          <p className="text-[13px] leading-[1.8] text-neutral-700">
            {data.skills.map((s) => s.name).join("  ·  ")}
          </p>
        </section>
      )}
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
          {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
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

/* ------------------------------------------------------------------ */
/* MODERN — sans, brand accent, sidebar for skills                     */
/* ------------------------------------------------------------------ */

function Modern({ data }: { data: CVData }) {
  const { personal: p } = data;
  const name = ph(p.fullName, "Your Name");
  const title = ph(p.title, "Professional Title");

  const contacts = [
    { icon: Mail, v: p.email },
    { icon: Phone, v: p.phone },
    { icon: MapPin, v: p.location },
    { icon: Linkedin, v: p.linkedin },
    { icon: Globe, v: p.portfolio },
  ].filter((c) => c.v?.trim());

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.15em] text-[#0B573C]">
      <span className="h-[7px] w-[7px] rounded-sm bg-[#0E6B49]" />
      {children}
    </h2>
  );

  return (
    <div className="font-sans text-neutral-800">
      {/* Header band */}
      <header className="bg-[#0A4531] px-[52px] py-[40px] text-white">
        <h1
          className={`text-[34px] font-extrabold leading-none tracking-tight ${
            name.empty ? "text-white/40" : "text-white"
          }`}
        >
          {name.text}
        </h1>
        <p
          className={`mt-2 text-[15px] font-medium ${
            title.empty ? "text-white/40" : "text-[#A9D2BF]"
          }`}
        >
          {title.text}
        </p>
        {contacts.length ? (
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
        ) : (
          <p className="mt-4 text-[11.5px] text-white/40">
            email · phone · location · linkedin
          </p>
        )}
      </header>

      <div className="grid grid-cols-[1fr_260px]">
        {/* Main column */}
        <div className="px-[40px] py-[36px]">
          <section className="mb-6">
            <Heading>Summary</Heading>
            <p
              className={`text-[12.5px] leading-[1.7] ${
                data.summary?.trim() ? "text-neutral-700" : "text-neutral-300"
              }`}
            >
              {data.summary?.trim() ||
                "A short professional summary highlighting your strengths and focus."}
            </p>
          </section>

          <section className="mb-6">
            <Heading>Experience</Heading>
            {data.experiences.length ? (
              <div className="space-y-4">
                {data.experiences.map((e) => (
                  <ModernExp key={e.id} e={e} />
                ))}
              </div>
            ) : (
              <p className="text-[12.5px] text-neutral-300">
                Your roles and achievements will appear here.
              </p>
            )}
          </section>

          <section>
            <Heading>Education</Heading>
            {data.educations.length ? (
              <div className="space-y-3">
                {data.educations.map((ed) => (
                  <ModernEdu key={ed.id} ed={ed} />
                ))}
              </div>
            ) : (
              <p className="text-[12.5px] text-neutral-300">
                Your education history will appear here.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="border-l border-neutral-200 bg-[#F6F8F6] px-[26px] py-[36px]">
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.15em] text-[#0B573C]">
            Skills
          </h2>
          {data.skills.length ? (
            <ul className="space-y-2.5">
              {data.skills.map((s) => (
                <ModernSkill key={s.id} s={s} />
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-neutral-400">
              Add skills to showcase your strengths.
            </p>
          )}
        </aside>
      </div>
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
          {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
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
          {[ed.startDate, ed.endDate].filter(Boolean).join(" – ")}
        </span>
      </div>
    </div>
  );
}

const LEVEL_PCT: Record<string, number> = {
  Beginner: 35,
  Intermediate: 60,
  Advanced: 82,
  Expert: 100,
};

function ModernSkill({ s }: { s: SkillItem }) {
  return (
    <li>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-neutral-800">
          {s.name}
        </span>
        <span className="text-[10px] text-neutral-500">{s.level}</span>
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-[#0E6B49]"
          style={{ width: `${LEVEL_PCT[s.level] ?? 60}%` }}
        />
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* MINIMAL — airy, understated, no color                               */
/* ------------------------------------------------------------------ */

function Minimal({ data }: { data: CVData }) {
  const { personal: p } = data;
  const name = ph(p.fullName, "Your Name");
  const title = ph(p.title, "Professional Title");

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
      {children}
    </h2>
  );

  return (
    <div className="font-sans px-[64px] py-[64px] text-neutral-800">
      <header className="mb-2">
        <h1
          className={`text-[32px] font-semibold leading-tight tracking-tight ${
            name.empty ? "text-neutral-300" : "text-neutral-900"
          }`}
        >
          {name.text}
        </h1>
        <p
          className={`mt-1 text-[15px] ${
            title.empty ? "text-neutral-300" : "text-neutral-500"
          }`}
        >
          {title.text}
        </p>
      </header>

      {hasAnyContact(p) ? (
        <p className="text-[12px] leading-relaxed text-neutral-500">
          {[p.email, p.phone, p.location, p.linkedin, p.portfolio]
            .filter((x) => x?.trim())
            .join("   /   ")}
        </p>
      ) : (
        <p className="text-[12px] text-neutral-300">email / phone / location</p>
      )}

      <div className="my-8 h-px w-full bg-neutral-200" />

      <section className="mb-9">
        <Heading>Profile</Heading>
        <p
          className={`text-[13px] leading-[1.85] ${
            data.summary?.trim() ? "text-neutral-700" : "text-neutral-300"
          }`}
        >
          {data.summary?.trim() ||
            "A short professional summary highlighting your strengths, focus and what you bring to a role."}
        </p>
      </section>

      <section className="mb-9">
        <Heading>Experience</Heading>
        {data.experiences.length ? (
          <div className="space-y-6">
            {data.experiences.map((e) => (
              <div key={e.id} className="grid grid-cols-[110px_1fr] gap-5">
                <span className="pt-0.5 text-[11px] uppercase tracking-wide text-neutral-400">
                  {[e.startDate, e.endDate].filter(Boolean).join(" – ") || "—"}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-neutral-900">
                    {e.position || "Position"}
                  </p>
                  <p className="text-[12.5px] text-neutral-500">
                    {[e.company, e.location].filter(Boolean).join(", ") ||
                      "Company"}
                  </p>
                  {e.description?.trim() && (
                    <p className="mt-1.5 text-[12.5px] leading-[1.7] text-neutral-600">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-neutral-300">
            Your roles and achievements will appear here.
          </p>
        )}
      </section>

      <section className="mb-9">
        <Heading>Education</Heading>
        {data.educations.length ? (
          <div className="space-y-4">
            {data.educations.map((ed) => (
              <div key={ed.id} className="grid grid-cols-[110px_1fr] gap-5">
                <span className="pt-0.5 text-[11px] uppercase tracking-wide text-neutral-400">
                  {[ed.startDate, ed.endDate].filter(Boolean).join(" – ") || "—"}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-neutral-900">
                    {ed.degree || "Degree"}
                    {ed.field ? `, ${ed.field}` : ""}
                  </p>
                  <p className="text-[12.5px] text-neutral-500">
                    {ed.institution || "Institution"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-neutral-300">
            Your education history will appear here.
          </p>
        )}
      </section>

      {data.skills.length > 0 && (
        <section>
          <Heading>Skills</Heading>
          <div className="flex flex-wrap gap-x-2 gap-y-2">
            {data.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-neutral-200 px-3 py-1 text-[12px] text-neutral-700"
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}
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
