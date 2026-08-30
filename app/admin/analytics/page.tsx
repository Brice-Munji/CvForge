import { Sparkles } from "lucide-react";
import { getSeries, getCVStats, type SeriesRange } from "@/lib/server/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { SeriesChart } from "@/components/admin/Chart";
import { RangeTabs } from "@/components/admin/RangeTabs";

export const dynamic = "force-dynamic";

const VALID: SeriesRange[] = ["7d", "30d", "90d", "12m"];

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const range = (VALID.includes(searchParams.range as SeriesRange)
    ? searchParams.range
    : "30d") as SeriesRange;

  const [users, revenue, cvs, applications, subscriptions, cvStats] =
    await Promise.all([
      getSeries("users", range),
      getSeries("revenue", range),
      getSeries("cvs", range),
      getSeries("applications", range),
      getSeries("subscriptions", range),
      getCVStats(),
    ]);

  const totalTemplates = cvStats.templates.reduce((a, t) => a + t.count, 0) || 1;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Trends over time, straight from the database."
        actions={<RangeTabs basePath="/admin/analytics" range={range} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="User growth">
          <SeriesChart points={users} />
        </Card>
        <Card title="Revenue (verified)">
          <SeriesChart points={revenue} valueSuffix=" XAF" />
        </Card>
        <Card title="CV creation">
          <SeriesChart points={cvs} />
        </Card>
        <Card title="Applications">
          <SeriesChart points={applications} color="#2563eb" />
        </Card>
        <Card title="New subscriptions">
          <SeriesChart points={subscriptions} color="#0A4531" />
        </Card>
        <Card title="Template popularity">
          {cvStats.templates.length === 0 ? (
            <p className="text-sm text-ink-muted">No CVs yet.</p>
          ) : (
            <div className="space-y-3">
              {cvStats.templates.map((t) => {
                const pct = Math.round((t.count / totalTemplates) * 100);
                return (
                  <div key={t.template}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium capitalize text-ink">{t.template}</span>
                      <span className="text-ink-muted">{pct}% · {t.count}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4">
        <Card title="AI analytics">
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong bg-canvas/40 px-5 py-8 text-center">
            <div className="mx-auto flex items-center gap-3 text-ink-muted">
              <Sparkles className="h-5 w-5 text-brand-500" />
              AI analytics will appear once AI features are enabled.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
