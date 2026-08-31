export type TemplateId = "classic" | "modern" | "minimal";

export const TEMPLATE_IDS: TemplateId[] = ["classic", "modern", "minimal"];

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface SkillItem {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export type LanguageLevel =
  | "Basic"
  | "Conversational"
  | "Professional"
  | "Fluent"
  | "Native";

export interface LanguageItem {
  id: string;
  name: string;
  level: LanguageLevel;
}

/** The template-independent CV content model. */
export interface CVData {
  template: TemplateId;
  personal: PersonalInfo;
  summary: string;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
}

export const SKILL_LEVELS: SkillLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

export const LANGUAGE_LEVELS: LanguageLevel[] = [
  "Basic",
  "Conversational",
  "Professional",
  "Fluent",
  "Native",
];

export const emptyPersonal: PersonalInfo = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
};

/** Realistic starter content — used for marketing previews only, never lorem ipsum. */
export const sampleCV: CVData = {
  template: "modern",
  personal: {
    fullName: "Alex Mbarga",
    title: "Software Developer",
    email: "alex.mbarga@email.com",
    phone: "+237 6 78 90 12 34",
    location: "Douala, Cameroon",
    linkedin: "linkedin.com/in/alexmbarga",
    portfolio: "alexmbarga.dev",
  },
  summary:
    "Software developer with hands-on experience building responsive web applications. Comfortable across the stack, focused on writing clean, maintainable code and shipping features that solve real problems for users.",
  experiences: [
    {
      id: "exp-1",
      position: "Software Developer",
      company: "Tech Company",
      location: "Douala, Cameroon",
      startDate: "Jan 2023",
      endDate: "Present",
      current: true,
      description:
        "Built and maintained customer-facing features using React and Node.js. Collaborated with designers to ship a redesigned dashboard that improved task completion. Reviewed code and mentored two junior developers.",
    },
    {
      id: "exp-2",
      position: "Frontend Developer (Intern)",
      company: "Digital Studio",
      location: "Yaoundé, Cameroon",
      startDate: "Jun 2022",
      endDate: "Dec 2022",
      current: false,
      description:
        "Implemented reusable UI components and improved page performance across the marketing site. Worked closely with the product team to translate designs into accessible, responsive interfaces.",
    },
  ],
  educations: [
    {
      id: "edu-1",
      institution: "University of Douala",
      degree: "Bachelor of Technology",
      field: "Computer Engineering",
      startDate: "2019",
      endDate: "2022",
      description: "",
    },
  ],
  skills: [
    { id: "sk-1", name: "JavaScript", level: "Advanced" },
    { id: "sk-2", name: "React", level: "Advanced" },
    { id: "sk-3", name: "Next.js", level: "Intermediate" },
    { id: "sk-4", name: "Node.js", level: "Intermediate" },
    { id: "sk-5", name: "TypeScript", level: "Intermediate" },
    { id: "sk-6", name: "Git", level: "Advanced" },
  ],
  projects: [
    {
      id: "pr-1",
      name: "TaskFlow",
      description:
        "A collaborative task manager with real-time updates and a clean, keyboard-friendly interface.",
      technologies: ["React", "Node.js", "PostgreSQL"],
      url: "github.com/alexmbarga/taskflow",
    },
  ],
  certifications: [],
  languages: [
    { id: "lang-1", name: "French", level: "Native" },
    { id: "lang-2", name: "English", level: "Professional" },
  ],
};

/** A clean starting point for a brand-new CV. */
export function createBlankCV(template: TemplateId = "classic"): CVData {
  return {
    template,
    personal: { ...emptyPersonal },
    summary: "",
    experiences: [],
    educations: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  };
}
