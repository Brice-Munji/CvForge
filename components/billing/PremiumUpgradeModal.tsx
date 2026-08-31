"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, Loader2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PLANS, formatMoney } from "@/lib/plans";
import { startCheckout } from "@/lib/plan-client";

const PRO_BENEFITS = [
  "Unlimited CVs & PDF downloads",
  "All premium templates",
  "Cover letters & application emails",
  "Unlimited job applications",
];

export function PremiumUpgradeModal({
  open,
  onClose,
  title = "Unlock this with CVForge Pro",
  message,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const monthly = PLANS.pro_monthly;

  const upgrade = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const { error } = await startCheckout("pro_monthly");
    if (error) {
      setError(error);
      setLoading(false);
    }
    // On success the browser is redirected to checkout.
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="upgrade-title">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 id="upgrade-title" className="font-display text-xl font-bold text-ink">
        {title}
      </h2>
      {message && <p className="mt-2 text-ink-muted">{message}</p>}

      <ul className="mt-4 space-y-2">
        {PRO_BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Check className="h-4 w-4 shrink-0 text-brand-600" />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-line bg-canvas px-4 py-3">
        <span className="font-display text-2xl font-extrabold text-ink">
          {formatMoney(monthly.price)}
        </span>
        <span className="text-ink-muted"> / month</span>
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/pricing");
          }}
          className="ml-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          See all plans
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Maybe Later
        </Button>
        <Button onClick={upgrade} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Starting…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Upgrade to Pro
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
