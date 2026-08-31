import type { SeriesPoint } from "@/lib/server/admin";

/** Lightweight dependency-free area/line chart for admin analytics. */
export function SeriesChart({
  points,
  height = 180,
  color = "#0E6B49",
  valuePrefix = "",
  valueSuffix = "",
}: {
  points: SeriesPoint[];
  height?: number;
  color?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  if (!points || points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-line-strong bg-canvas/40 text-sm text-ink-muted"
        style={{ height }}
      >
        No data for this period yet.
      </div>
    );
  }

  const W = 720;
  const H = height;
  const padX = 6;
  const padY = 16;
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const n = points.length;

  const x = (i: number) =>
    padX + (n === 1 ? W / 2 : (i / (n - 1)) * (W - padX * 2));
  const y = (v: number) => padY + (1 - (v - min) / span) * (H - padY * 2);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(n - 1).toFixed(1)} ${H - padY} L ${x(0).toFixed(
    1
  )} ${H - padY} Z`;

  const total = values.reduce((a, b) => a + b, 0);
  const last = points[n - 1];

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-display text-xl font-extrabold text-ink">
          {valuePrefix}
          {total.toLocaleString("en-US")}
          {valueSuffix}
        </span>
        <span className="text-xs text-ink-muted">
          peak {valuePrefix}
          {max.toLocaleString("en-US")}
          {valueSuffix}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[180px] w-full"
        style={{ height }}
        role="img"
        aria-label="Time series chart"
      >
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* baseline */}
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="#E9E5DD" strokeWidth="1" />
        <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(n - 1)} cy={y(last.value)} r="3.5" fill={color} />
      </svg>
      <div className="mt-1.5 flex justify-between text-[0.7rem] text-ink-faint">
        <span>{points[0].date}</span>
        <span>{last.date}</span>
      </div>
    </div>
  );
}
