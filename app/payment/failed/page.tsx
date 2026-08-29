import { XCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 py-10 text-center">
      <Logo />
      <div className="mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-600">
        <XCircle className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-heading font-bold text-ink">
        Payment wasn&apos;t completed.
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        Your payment may have been cancelled, failed, or expired. You haven&apos;t
        been charged and your plan is unchanged.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button href="/pricing">Try Again</Button>
        <Button href="/dashboard" variant="secondary">
          Back to CVForge
        </Button>
      </div>
    </div>
  );
}
