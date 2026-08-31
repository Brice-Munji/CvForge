export type ApplicationStatus =
  | "Saved"
  | "Preparing"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Saved",
  "Preparing",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

/** Neutral, accessible status styling — never relies on color alone (uses a
 *  labelled dot + text). Tones are muted per the brand guidance. */
export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; dot: string; chip: string; text: string }
> = {
  Saved: {
    label: "Saved",
    dot: "bg-ink-faint",
    chip: "bg-ink/[0.05] border-line-strong",
    text: "text-ink-soft",
  },
  Preparing: {
    label: "Preparing",
    dot: "bg-amber-500",
    chip: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
  },
  Applied: {
    label: "Applied",
    dot: "bg-brand-500",
    chip: "bg-brand-50 border-brand-200",
    text: "text-brand-700",
  },
  Interview: {
    label: "Interview",
    dot: "bg-blue-500",
    chip: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
  },
  Offer: {
    label: "Offer",
    dot: "bg-emerald-600",
    chip: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
  },
  Rejected: {
    label: "Rejected",
    dot: "bg-rose-400",
    chip: "bg-rose-50 border-rose-200",
    text: "text-rose-800",
  },
};

export function isApplicationStatus(v: unknown): v is ApplicationStatus {
  return (
    typeof v === "string" &&
    (APPLICATION_STATUSES as string[]).includes(v)
  );
}

export interface ApplicationStats {
  total: number;
  active: number; // not Rejected and not Offer? -> "active" = Saved/Preparing/Applied/Interview
  applied: number; // Applied + Interview + Offer + Rejected (reached the employer)
  interviews: number;
  offers: number;
  rejected: number;
}
