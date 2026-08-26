import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { A4Frame } from "@/components/cv/A4Frame";
import { CVDocument } from "@/components/cv/CVDocument";
import { sampleCV } from "@/lib/cv-types";

const points = [
  "Choose from professional templates",
  "Live preview as you type",
  "A clean, send-ready CV",
];

export function AuthShell({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-5 py-6 sm:px-8">
        <div className="section-x flex items-center justify-between px-0">
          <Logo />
          <Link
            href="/"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            ← Back home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <p className="eyebrow">{eyebrow}</p>
            {children}
          </div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden border-l border-line bg-brand-900 lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-700/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-brand-800/60 blur-3xl" />
          <div className="absolute inset-0 noise-overlay opacity-50" />
        </div>

        <div className="relative flex h-full flex-col justify-center px-14 py-16">
          <h2 className="max-w-md font-display text-[2.4rem] font-extrabold leading-tight tracking-tight text-white text-balance">
            Create a professional CV in minutes.
          </h2>
          <ul className="mt-7 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-brand-100">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-300" />
                <span className="text-[0.98rem]">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 w-full max-w-[300px] rotate-[-2deg]">
            <A4Frame>
              <CVDocument data={sampleCV} />
            </A4Frame>
          </div>
        </div>
      </div>
    </div>
  );
}
