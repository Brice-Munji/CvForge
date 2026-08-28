import { ArrowRight } from "lucide-react";
import type { ApplicationStats } from "@/lib/application-types";

/** Elegant, real-data funnel: Applications → Interviews → Offers. */
export function ApplicationFunnel({ stats }: { stats: ApplicationStats }) {
  const steps = [
    { label: "Applications", value: stats.total, tone: "bg-brand-600" },
    { label: "Interviews", value: stats.interviews, tone: "bg-blue-500" },
    { label: "Offers", value: stats.offers, tone: "bg-emerald-600" },
  ];
  const max = Math.max(stats.total, 1);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
        Your funnel
      </h2>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center gap-3">
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-soft">{s.label}</span>
                <span className="font-display text-lg font-extrabold text-ink">
                  {s.value}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className={`h-full rounded-full ${s.tone} transition-all duration-500`}
                  style={{ width: `${Math.round((s.value / max) * 100)}%` }}
                />
              </div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-ink-faint sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatTiles({ stats }: { stats: ApplicationStats }) {
  const tiles = [
    { label: "Total", value: stats.total },
    { label: "Sent", value: stats.applied },
    { label: "Interviews", value: stats.interviews },
    { label: "Offers", value: stats.offers },
    { label: "Rejected", value: stats.rejected },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-xl border border-line bg-surface px-4 py-3.5"
        >
          <p className="font-display text-2xl font-extrabold text-ink">{t.value}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{t.label}</p>
        </div>
      ))}
    </div>
  );
}
