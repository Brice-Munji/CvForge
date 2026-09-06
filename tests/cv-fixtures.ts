import type { CVData } from "@/lib/cv-types";

/** A completely empty CV — the "empty CV" edge case. */
export function emptyCv(): CVData {
  return {
    template: "classic",
    personal: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
    },
    summary: "",
    experiences: [],
    educations: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  };
}

/** A strong, complete software-developer CV. */
export function developerCv(): CVData {
  return {
    template: "modern",
    personal: {
      fullName: "Alex Mbarga",
      title: "Frontend Developer",
      email: "alex@example.com",
      phone: "+237 6 78 90 12 34",
      location: "Douala, Cameroon",
      linkedin: "linkedin.com/in/alexmbarga",
      portfolio: "alexmbarga.dev",
    },
    summary:
      "Frontend developer with four years building responsive React applications. Focused on clean, maintainable TypeScript, strong testing, and shipping features that improve real user metrics.",
    experiences: [
      {
        id: "e1",
        position: "Frontend Developer",
        company: "Tech Company",
        location: "Douala",
        startDate: "Jan 2022",
        endDate: "Present",
        current: true,
        description:
          "Led a redesign of the dashboard using React and TypeScript that increased task completion by 30%. Built a component library, added automated testing and improved API integration.",
      },
      {
        id: "e2",
        position: "Junior Developer",
        company: "Digital Studio",
        location: "Yaoundé",
        startDate: "Jun 2020",
        endDate: "Dec 2021",
        current: false,
        description:
          "Developed customer-facing features with JavaScript and CSS. Improved page load times by 40% and reduced bugs through code review.",
      },
    ],
    educations: [
      {
        id: "ed1",
        institution: "University of Douala",
        degree: "BSc",
        field: "Computer Science",
        startDate: "2016",
        endDate: "2019",
        description: "",
      },
    ],
    skills: [
      { id: "s1", name: "JavaScript", level: "Expert" },
      { id: "s2", name: "TypeScript", level: "Advanced" },
      { id: "s3", name: "React", level: "Expert" },
      { id: "s4", name: "CSS", level: "Advanced" },
      { id: "s5", name: "Git", level: "Advanced" },
      { id: "s6", name: "Testing", level: "Intermediate" },
    ],
    projects: [
      {
        id: "p1",
        name: "Portfolio site",
        description: "Personal site built with Next.js.",
        technologies: ["Next.js", "React"],
        url: "https://alexmbarga.dev",
      },
    ],
    certifications: [],
    languages: [{ id: "l1", name: "English", level: "Fluent" }],
  };
}
