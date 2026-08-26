import { FileQuestion } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function BuilderNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <div className="mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-heading font-bold text-ink">CV not found</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        This CV doesn&apos;t exist, or it isn&apos;t available on your account.
        Let&apos;s head back to your dashboard.
      </p>
      <div className="mt-8">
        <Button href="/dashboard">Back to Dashboard</Button>
      </div>
    </div>
  );
}
