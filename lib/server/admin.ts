import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { supabaseEnabled } from "@/lib/auth/config";
import { isSandboxMode } from "@/lib/payments/provider";
import { getPlan, planTier } from "@/lib/plans";

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/* ------------------------------------------------------------------ */

function startOfDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function startOfMonth(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function startOfYear(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

/** Where-clause matching subscriptions that are effectively Pro right now. */
function effectiveProWhere(now = new Date()): Prisma.SubscriptionWhereInput {
  return {
    status: { in: ["ACTIVE", "TRIALING"] },
    OR: [{ grantType: "admin" }, { currentPeriodEnd: { gt: now } }],
  };
}

/** Derive a user's effective plan tier + display status from their subscription. */
export function deriveUserPlan(
  sub:
    | {
        plan: string;
        status: string;
        currentPeriodEnd: Date | null;
        grantType: string;
      }
    | null,
  now = new Date()
): { tier: "free" | "pro"; planLabel: string; grantType: string | null } {
  if (!sub) return { tier: "free", planLabel: "Free", grantType: null };
  const activeish = sub.status === "ACTIVE" || sub.status === "TRIALING";
  const valid =
    sub.grantType === "admin"
      ? activeish
      : activeish && !!sub.currentPeriodEnd && sub.currentPeriodEnd > now;
  if (valid && planTier(sub.plan) === "pro") {
    return {
      tier: "pro",
      planLabel: getPlan(sub.plan).name,
      grantType: sub.grantType,
    };
  }
  return { tier: "free", planLabel: "Free", grantType: sub.grantType };
}

/* ------------------------------------------------------------------ */
/* Overview + stat groups                                              */
/* ------------------------------------------------------------------ */

export async function getOverview() {
  const now = new Date();
  const [
    totalUsers,
    proUsers,
    totalCVs,
    totalApplications,
    revenueAgg,
    pdfDownloads,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.subscription.count({ where: effectiveProWhere(now) }),
    prisma.cV.count(),
    prisma.application.count(),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.exportEvent.count({ where: { type: "PDF_DOWNLOAD" } }),
  ]);

  return {
    totalUsers,
    proUsers,
    totalCVs,
    totalApplications,
    revenue: revenueAgg._sum.amount ?? 0,
    pdfDownloads,
  };
}

export async function getUserStats() {
  const [total, newToday, newWeek, newMonth, active] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { createdAt: { gte: startOfDay() } } }),
    prisma.profile.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.profile.count({ where: { createdAt: { gte: startOfMonth() } } }),
    // "Active" = users with a CV or application touched in the last 30 days.
    prisma.profile.count({
      where: {
        OR: [
          { cvs: { some: { updatedAt: { gte: daysAgo(30) } } } },
          { applications: { some: { updatedAt: { gte: daysAgo(30) } } } },
        ],
      },
    }),
  ]);
  return { total, newToday, newWeek, newMonth, active };
}

async function sumRevenue(where: Prisma.PaymentWhereInput): Promise<number> {
  const agg = await prisma.payment.aggregate({
    where: { status: "SUCCESS", ...where },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

export async function getRevenueStats() {
  const [total, today, month, year, success, failed, pending] =
    await Promise.all([
      sumRevenue({}),
      sumRevenue({ createdAt: { gte: startOfDay() } }),
      sumRevenue({ createdAt: { gte: startOfMonth() } }),
      sumRevenue({ createdAt: { gte: startOfYear() } }),
      prisma.payment.count({ where: { status: "SUCCESS" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
    ]);
  return {
    total,
    today,
    month,
    year,
    success,
    failed,
    pending,
    currency: "XAF",
  };
}

export async function getSubscriptionStats() {
  const now = new Date();
  const [totalUsers, proUsers, active, canceled, expired, adminGranted] =
    await Promise.all([
      prisma.profile.count(),
      prisma.subscription.count({ where: effectiveProWhere(now) }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { cancelAtPeriodEnd: true } }),
      prisma.subscription.count({ where: { status: "EXPIRED" } }),
      prisma.subscription.count({
        where: { grantType: "admin", ...effectiveProWhere(now) },
      }),
    ]);
  const freeUsers = Math.max(0, totalUsers - proUsers);
  const conversion = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0;
  return {
    freeUsers,
    proUsers,
    active,
    canceled,
    expired,
    adminGranted,
    conversion,
  };
}

export async function getCVStats() {
  const [total, today, week, pdfExports, byTemplate] = await Promise.all([
    prisma.cV.count(),
    prisma.cV.count({ where: { createdAt: { gte: startOfDay() } } }),
    prisma.cV.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.exportEvent.count({ where: { type: "PDF_DOWNLOAD" } }),
    prisma.cV.groupBy({ by: ["template"], _count: { _all: true } }),
  ]);
  const templates = byTemplate
    .map((t) => ({ template: t.template, count: t._count._all }))
    .sort((a, b) => b.count - a.count);
  return { total, today, week, pdfExports, templates };
}

export async function getApplicationStats() {
  const [total, thisMonth, byStatus] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { createdAt: { gte: startOfMonth() } } }),
    prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s: string) =>
    byStatus.find((r) => r.status === s)?._count._all ?? 0;
  return {
    total,
    thisMonth,
    applied: count("Applied") + count("Interview") + count("Offer") + count("Rejected"),
    interviews: count("Interview"),
    offers: count("Offer"),
    rejected: count("Rejected"),
  };
}

/* ------------------------------------------------------------------ */
/* Time series (raw SQL, efficient date bucketing)                     */
/* ------------------------------------------------------------------ */

export type SeriesRange = "7d" | "30d" | "90d" | "12m";
export interface SeriesPoint {
  date: string;
  value: number;
}

function rangeConfig(range: SeriesRange): { since: Date; unit: "day" | "month" } {
  switch (range) {
    case "7d":
      return { since: daysAgo(7), unit: "day" };
    case "90d":
      return { since: daysAgo(90), unit: "day" };
    case "12m":
      return { since: daysAgo(365), unit: "month" };
    case "30d":
    default:
      return { since: daysAgo(30), unit: "day" };
  }
}

async function bucketed(
  table: '"Profile"' | '"CV"' | '"Application"' | '"Payment"' | '"Subscription"',
  range: SeriesRange,
  extraWhere = "",
  valueExpr = "count(*)::int"
): Promise<SeriesPoint[]> {
  const { since, unit } = rangeConfig(range);
  const q = `
    select to_char(date_trunc('${unit}', "createdAt"), 'YYYY-MM-DD') as date,
           ${valueExpr} as value
    from ${table}
    where "createdAt" >= $1 ${extraWhere}
    group by 1 order by 1`;
  const rows = await prisma.$queryRawUnsafe<{ date: string; value: number | bigint }[]>(
    q,
    since
  );
  return rows.map((r) => ({ date: r.date, value: Number(r.value) }));
}

export async function getSeries(
  kind: "users" | "revenue" | "cvs" | "applications" | "subscriptions",
  range: SeriesRange
): Promise<SeriesPoint[]> {
  switch (kind) {
    case "users":
      return bucketed('"Profile"', range);
    case "cvs":
      return bucketed('"CV"', range);
    case "applications":
      return bucketed('"Application"', range);
    case "revenue":
      return bucketed('"Payment"', range, `and status = 'SUCCESS'`, "sum(amount)::int");
    case "subscriptions":
      return bucketed('"Subscription"', range);
    default:
      return [];
  }
}

/* ------------------------------------------------------------------ */
/* Recent activity                                                     */
/* ------------------------------------------------------------------ */

export interface ActivityItem {
  type: string;
  label: string;
  user: string;
  at: string;
}

export async function getRecentActivity(limit = 12): Promise<ActivityItem[]> {
  const sel = { user: { select: { email: true, name: true } } };
  const [users, cvs, exports, subs, payments, apps] = await Promise.all([
    prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { email: true, name: true, createdAt: true },
    }),
    prisma.cV.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { createdAt: true, ...sel } }),
    prisma.exportEvent.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { createdAt: true, ...sel } }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { createdAt: true, grantType: true, ...sel },
    }),
    prisma.payment.findMany({ where: { status: "SUCCESS" }, orderBy: { createdAt: "desc" }, take: 6, select: { createdAt: true, ...sel } }),
    prisma.application.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { createdAt: true, ...sel } }),
  ]);

  const label = (u: { email: string; name: string | null } | null | undefined) =>
    u?.name?.trim() || u?.email || "Someone";

  const items: ActivityItem[] = [
    ...users.map((u) => ({ type: "user", label: "New user registered", user: label(u), at: u.createdAt.toISOString() })),
    ...cvs.map((c) => ({ type: "cv", label: "Created a CV", user: label(c.user), at: c.createdAt.toISOString() })),
    ...exports.map((e) => ({ type: "pdf", label: "Downloaded a PDF", user: label(e.user), at: e.createdAt.toISOString() })),
    ...subs.map((s) => ({ type: "sub", label: s.grantType === "admin" ? "Pro granted by admin" : "New Pro subscription", user: label(s.user), at: s.createdAt.toISOString() })),
    ...payments.map((p) => ({ type: "payment", label: "Payment successful", user: label(p.user), at: p.createdAt.toISOString() })),
    ...apps.map((a) => ({ type: "application", label: "Created an application", user: label(a.user), at: a.createdAt.toISOString() })),
  ];

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* System health                                                       */
/* ------------------------------------------------------------------ */

export async function getSystemHealth() {
  let db = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch {
    db = false;
  }
  return {
    database: { ok: db, label: db ? "Operational" : "Unavailable" },
    authentication: {
      ok: true,
      label: supabaseEnabled() ? "Supabase" : "Local provider",
    },
    payments: {
      ok: true,
      label: isSandboxMode() ? "Sandbox mode" : "Live provider",
    },
    ai: { ok: false, label: "Not enabled" },
  };
}
