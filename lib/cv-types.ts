export type TemplateId = "classic" | "modern" | "minimal";

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
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface SkillItem {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface CVData {
  template: TemplateId;
  personal: PersonalInfo;
  summary: string;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: SkillItem[];
}

export const SKILL_LEVELS: SkillLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
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

/** Realistic starter content — never lorem ipsum. */
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
};

/** A clean starting point for a brand-new CV in the builder. */
export function createBlankCV(template: TemplateId = "modern"): CVData {
  return {
    template,
    personal: { ...emptyPersonal },
    summary: "",
    experiences: [],
    educations: [],
    skills: [],
  };
}
