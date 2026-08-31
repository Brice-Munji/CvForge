"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProBadge } from "./ProBadge";
import { PLANS, formatMoney, annualSavings } from "@/lib/plans";
import { startCheckout } from "@/lib/plan-client";
import { cn } from "@/lib/utils";

export function PricingCards({
  loggedIn,
  isPro,
}: {
  loggedIn: boolean;
  isPro: boolean;
}) {
  const router = useRouter();
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const free = PLANS.free;
  const pro = interval === "month" ? PLANS.pro_monthly : PLANS.pro_yearly;
  const savings = annualSavings();

  const onProCta = async () => {
    if (isPro) {
      router.push("/settings/billing");
      return;
    }
    if (!loggedIn) {
      router.push("/signup?redirect=/pricing");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await startCheckout(
      interval === "month" ? "pro_monthly" : "pro_yearly"
    );
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface p-1">
          {(["month", "year"] as const).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInterval(i)}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                interval === i ? "text-white" : "text-ink-soft hover:text-ink"
              )}
            >
              {interval === i && (
                <motion.span
                  layoutId="billing-toggle"
                  className="absolute inset-0 rounded-full bg-brand-600"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                {i === "month" ? "Monthly" : "Yearly"}
              </span>
            </button>
          ))}
        </div>
        {interval === "year" && (
          <span className="ml-3 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Save {savings.percent}%
          </span>
        )}
      </div>

      {error && (
        <div className="mx-auto mt-6 flex max-w-md items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mx-auto mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-7">
          <h3 className="font-display text-xl font-bold text-ink">{free.name}</h3>
          <p className="mt-2">
            <span className="font-display text-4xl font-extrabold text-ink">
              {formatMoney(0)}
            </span>
          </p>
          <p className="mt-1 text-sm text-ink-muted">Everything to get started.</p>
          <ul className="mt-6 space-y-2.5">
            {free.features.map((f) => (
              <Feature key={f} text={f} />
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <Button
              href={loggedIn ? "/dashboard" : "/signup"}
              variant="secondary"
              className="w-full"
            >
              {loggedIn ? "Go to Dashboard" : "Start Free"}
            </Button>
          </div>
        </div>

        {/* Pro */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          className="relative flex flex-col rounded-2xl border-2 border-brand-600 bg-surface p-6 shadow-card sm:p-7"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-ink">
              {PLANS.pro_monthly.name}
            </h3>
            <ProBadge />
          </div>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-extrabold text-ink">
              {formatMoney(pro.price)}
            </span>
            <span className="text-ink-muted">
              / {interval === "month" ? "month" : "year"}
            </span>
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {interval === "year"
              ? `Billed yearly — save ${formatMoney(savings.amount)}.`
              : "Billed monthly. Cancel anytime."}
          </p>
          <ul className="mt-6 space-y-2.5">
            {PLANS.pro_monthly.features.map((f) => (
              <Feature key={f} text={f} highlight />
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <Button onClick={onProCta} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                </>
              ) : isPro ? (
                "Manage subscription"
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Get CVForge Pro
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-ink-soft">
      <Check
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          highlight ? "text-brand-600" : "text-ink-muted"
        )}
      />
      {text}
    </li>
  );
}
