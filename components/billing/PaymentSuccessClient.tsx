"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

type State = "verifying" | "success" | "pending" | "failed";

export function PaymentSuccessClient({ reference }: { reference: string }) {
  const [state, setState] = useState<State>("verifying");
  const [checking, setChecking] = useState(false);

  const verify = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.verified) setState("success");
      else if (data.pending) setState("pending");
      else setState("failed");
    } catch {
      setState("pending");
    } finally {
      setChecking(false);
    }
  }, [reference]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 py-10 text-center">
      <Logo />
      <div className="mt-10 w-full max-w-md">
        {state === "verifying" && (
          <Panel
            icon={<Loader2 className="h-8 w-8 animate-spin" />}
            title="Confirming your payment…"
            body="Hold on a moment while we verify your payment with the provider."
          />
        )}

        {state === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-heading font-extrabold text-ink">
              Welcome to CVForge Pro 🎉
            </h1>
            <p className="mt-3 text-ink-muted">
              You now have access to all your Pro features — unlimited CVs,
              every template, cover letters and more.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/dashboard" size="lg">
                Start Building
              </Button>
              <Button href="/settings/billing" variant="secondary" size="lg">
                View Billing
              </Button>
            </div>
          </motion.div>
        )}

        {state === "pending" && (
          <div>
            <Panel
              icon={<Clock className="h-8 w-8" />}
              title="Your payment is being verified."
              body="This can take a moment. You can check again, or head to your dashboard — Pro will activate automatically once the payment is confirmed."
            />
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={verify} disabled={checking}>
                {checking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                  </>
                ) : (
                  "Check again"
                )}
              </Button>
              <Button href="/dashboard" variant="secondary">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {state === "failed" && (
          <div>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-heading font-bold text-ink">
              We couldn&apos;t confirm this payment.
            </h1>
            <p className="mt-3 text-ink-muted">
              No charge has activated Pro. You can try again from the pricing
              page.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/pricing">Try Again</Button>
              <Button href="/dashboard" variant="secondary">
                Back to CVForge
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Panel({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h1 className="mt-6 text-heading font-bold text-ink">{title}</h1>
      <p className="mt-3 text-ink-muted">{body}</p>
    </div>
  );
}
