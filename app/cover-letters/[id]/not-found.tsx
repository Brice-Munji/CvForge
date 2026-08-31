import { Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function CoverLetterNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <div className="mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Mail className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-heading font-bold text-ink">
        Cover letter not found
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        This cover letter doesn&apos;t exist, or it isn&apos;t available on your
        account.
      </p>
      <div className="mt-8">
        <Button href="/cover-letters">Back to Cover Letters</Button>
      </div>
    </div>
  );
}
