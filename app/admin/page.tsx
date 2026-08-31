import {
  Users,
  Crown,
  FileText,
  Briefcase,
  Wallet,
  Download,
  UserPlus,
  FileEdit,
  CreditCard,
  Activity,
} from "lucide-react";
import {
  getOverview,
  getUserStats,
  getRevenueStats,
  getSubscriptionStats,
  getCVStats,
  getApplicationStats,
  getRecentActivity,
  getSystemHealth,
  getSeries,
} from "@/lib/server/admin";
import { formatMoney } from "@/lib/plans";
import { relativeTime } from "@/lib/format";
import { StatCard, Card, PageHeader, EmptyState } from "@/components/admin/ui";
import { SeriesChart } from "@/components/admin/Chart";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [
    overview,
    users,
    revenue,
    subs,
    cvs,
    apps,
    activity,
    health,
    userSeries,
    revenueSeries,
  ] = await Promise.all([
    getOverview(),
    getUserStats(),
    getRevenueStats(),
    getSubscriptionStats(),
    getCVStats(),
    getApplicationStats(),
    getRecentActivity(10),
    getSystemHealth(),
    getSeries("users", "30d"),
    getSeries("revenue", "30d"),
  ]);

  const topTemplate = cvs.templates[0];

  return (
    <div>
      <PageHeader
        title="Platform overview"
        description="Live snapshot of CVForge — all figures come straight from the database."
      />

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total users" value={overview.totalUsers} icon={<Users className="h-4 w-4" />} sub={`${users.newToday} today`} />
        <StatCard label="Premium users" value={overview.proUsers} icon={<Crown className="h-4 w-4" />} sub={`${subs.conversion.toFixed(1)}% conversion`} />
        <StatCard label="Total CVs" value={overview.totalCVs} icon={<FileText className="h-4 w-4" />} sub={`${cvs.today} today`} />
        <StatCard label="Applications" value={overview.totalApplications} icon={<Briefcase className="h-4 w-4" />} sub={`${apps.thisMonth} this month`} />
        <StatCard label="Revenue" value={formatMoney(overview.revenue)} icon={<Wallet className="h-4 w-4" />} sub={`${revenue.success} payments`} />
        <StatCard label="PDF downloads" value={overview.pdfDownloads} icon={<Download className="h-4 w-4" />} />
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="User growth · 30 days">
          <SeriesChart points={userSeries} />
        </Card>
        <Card title="Revenue · 30 days">
          <SeriesChart points={revenueSeries} valueSuffix=" XAF" />
        </Card>
      </div>

      {/* Stat groups */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Users">
          <MetricRow label="New today" value={users.newToday} />
          <MetricRow label="New this week" value={users.newWeek} />
          <MetricRow label="New this month" value={users.newMonth} />
          <MetricRow label="Active (30d)" value={users.active} last />
        </Card>
        <Card title="Revenue">
          <MetricRow label="Today" value={formatMoney(revenue.today)} />
          <MetricRow label="This month" value={formatMoney(revenue.month)} />
          <MetricRow label="This year" value={formatMoney(revenue.year)} />
          <MetricRow label="Successful / Failed / Pending" value={`${revenue.success} / ${revenue.failed} / ${revenue.pending}`} last />
        </Card>
        <Card title="Subscriptions">
          <MetricRow label="Free users" value={subs.freeUsers} />
          <MetricRow label="Pro users" value={subs.proUsers} />
          <MetricRow label="Active / Canceled / Expired" value={`${subs.active} / ${subs.canceled} / ${subs.expired}`} />
          <MetricRow label="Conversion rate" value={`${subs.conversion.toFixed(2)}%`} last />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="CVs">
          <MetricRow label="Total created" value={cvs.total} />
          <MetricRow label="Created today" value={cvs.today} />
          <MetricRow label="Created this week" value={cvs.week} />
          <MetricRow label="PDF exports" value={cvs.pdfExports} last />
          {topTemplate && (
            <p className="mt-3 text-xs text-ink-muted">
              Most popular: <span className="font-semibold capitalize text-ink">{topTemplate.template}</span>{" "}
              ({Math.round((topTemplate.count / (cvs.total || 1)) * 100)}%)
            </p>
          )}
        </Card>
        <Card title="Applications">
          <MetricRow label="Total" value={apps.total} />
          <MetricRow label="This month" value={apps.thisMonth} />
          <MetricRow label="Applied" value={apps.applied} />
          <MetricRow label="Interviews / Offers / Rejected" value={`${apps.interviews} / ${apps.offers} / ${apps.rejected}`} last />
        </Card>
        <Card title="System health">
          <HealthRow label="Database" ok={health.database.ok} value={health.database.label} />
          <HealthRow label="Authentication" ok={health.authentication.ok} value={health.authentication.label} />
          <HealthRow label="Payments" ok={health.payments.ok} value={health.payments.label} />
          <HealthRow label="AI" ok={health.ai.ok} value={health.ai.label} last />
        </Card>
      </div>

      {/* Recent activity */}
      <div className="mt-4">
        <Card title="Recent activity">
          {activity.length === 0 ? (
            <EmptyState message="No platform activity yet." />
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-canvas text-ink-muted">
                    <ActivityIcon type={a.type} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">
                      <span className="font-medium">{a.user}</span>{" "}
                      <span className="text-ink-muted">· {a.label}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-faint">
                    {relativeTime(a.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string | number;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2.5",
        !last && "border-b border-line"
      )}
    >
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </span>
    </div>
  );
}

function HealthRow({
  label,
  ok,
  value,
  last,
}: {
  label: string;
  ok: boolean;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2.5",
        !last && "border-b border-line"
      )}
    >
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            ok ? "bg-brand-500" : "bg-ink-faint"
          )}
        />
        {value}
      </span>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const cls = "h-4 w-4";
  switch (type) {
    case "user":
      return <UserPlus className={cls} />;
    case "cv":
      return <FileEdit className={cls} />;
    case "pdf":
      return <Download className={cls} />;
    case "sub":
      return <Crown className={cls} />;
    case "payment":
      return <CreditCard className={cls} />;
    default:
      return <Activity className={cls} />;
  }
}
