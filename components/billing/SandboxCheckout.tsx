"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { formatMoney, getPlan } from "@/lib/plans";

/**
 * Sandbox provider checkout. Simulates a hosted payment page so the full
 * payment → verify → activation pipeline works without a live provider.
 * A real provider replaces this with its own hosted checkout.
 */
export function SandboxCheckout({
  reference,
  amount,
  currency,
  plan,
}: {
  reference: string;
  amount: number;
  currency: string;
  plan: string;
}) {
  const [loading, setLoading] = useState<null | "success" | "failed">(null);
  const planName = getPlan(plan).name;

  const complete = async (outcome: "success" | "failed") => {
    if (loading) return;
    setLoading(outcome);
    try {
      await fetch("/api/payments/sandbox/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, outcome }),
      });
    } catch {
      /* proceed to the result page regardless */
    }
    window.location.href =
      outcome === "success"
        ? `/payment/success?ref=${encodeURIComponent(reference)}`
        : `/payment/failed?ref=${encodeURIComponent(reference)}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <Logo />
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <div className="border-b border-line bg-canvas/60 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <Lock className="h-4 w-4 text-brand-600" />
              Secure checkout
              <span className="ml-auto rounded-md bg-amber-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-800">
                Sandbox
              </span>
            </div>
          </div>

          <div className="px-6 py-6">
            <p className="text-sm text-ink-muted">You&apos;re subscribing to</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
              {planName}
            </h1>
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold text-ink">
                {formatMoney(amount, currency)}
              </span>
            </p>

            <div className="mt-5 rounded-xl border border-line bg-canvas px-4 py-3 text-xs text-ink-muted">
              This is a sandbox payment page for development. Choose an outcome to
              simulate the provider. Your subscription is only activated after the
              server verifies the transaction.
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => complete("success")}
                size="lg"
                className="w-full"
                disabled={loading !== null}
              >
                {loading === "success" ? (
                  <>
                    <Loader2 className="h-[18px] w-[18px] animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-[18px] w-[18px] mr-1" /> Simulate
                    successful payment
                  </>
                )}
              </Button>
              <Button
                onClick={() => complete("failed")}
                variant="secondary"
                className="w-full"
                disabled={loading !== null}
              >
                {loading === "failed" ? "Cancelling…" : "Cancel / simulate failure"}
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-faint">
          Reference: {reference}
        </p>
      </div>
    </div>
  );
}
