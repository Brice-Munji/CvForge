import { Check, Sparkles } from "lucide-react";
import { AppHeader, type HeaderUser } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { ProBadge } from "./ProBadge";
import { PLANS, formatMoney } from "@/lib/plans";

/**
 * A polished "this is a Pro feature" landing — shows the value and an upgrade
 * path rather than hiding the feature or a blunt "access denied".
 */
export function ProFeatureGate({
  user,
  icon,
  title,
  description,
  benefits,
}: {
  user: HeaderUser;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} nav />
      <main className="mx-auto w-full max-w-xl px-5 py-16 sm:py-20">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            {icon}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <h1 className="font-display text-2xl font-extrabold text-ink">
              {title}
            </h1>
            <ProBadge />
          </div>
          <p className="mx-auto mt-2 max-w-sm text-ink-muted">{description}</p>

          <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-ink-soft">
                <Check className="h-4 w-4 shrink-0 text-brand-600" />
                {b}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-ink-muted">
            From{" "}
            <span className="font-display text-lg font-extrabold text-ink">
              {formatMoney(PLANS.pro_monthly.price)}
            </span>{" "}
            / month
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/pricing" size="lg">
              <Sparkles className="h-[18px] w-[18px]" /> Upgrade to unlock
            </Button>
            <Button href="/dashboard" variant="secondary" size="lg">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
