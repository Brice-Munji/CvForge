import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deriveUserPlan } from "@/lib/server/admin";
import { getPlan } from "@/lib/plans";

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

function clampPage(page?: number, pageSize?: number) {
  const ps = Math.min(Math.max(pageSize ?? 20, 1), 100);
  const p = Math.max(page ?? 1, 1);
  return { p, ps, skip: (p - 1) * ps };
}

function proWhere(now = new Date()): Prisma.SubscriptionWhereInput {
  return {
    status: { in: ["ACTIVE", "TRIALING"] },
    OR: [{ grantType: "admin" }, { currentPeriodEnd: { gt: now } }],
  };
}

/* ---------------- Users ---------------- */

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  disabled: boolean;
  planLabel: string;
  tier: "free" | "pro";
  grantType: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listUsers(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  filter?: "all" | "free" | "pro" | "admin";
  sort?: "newest" | "oldest" | "name";
}): Promise<Page<AdminUserRow>> {
  const { p, ps, skip } = clampPage(opts.page, opts.pageSize);
  const now = new Date();
  const where: Prisma.ProfileWhereInput = {};
  const q = opts.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (opts.filter === "admin") where.role = "ADMIN";
  else if (opts.filter === "pro") where.subscription = { is: proWhere(now) };
  else if (opts.filter === "free")
    where.NOT = { subscription: { is: proWhere(now) } };

  const orderBy: Prisma.ProfileOrderByWithRelationInput =
    opts.sort === "oldest"
      ? { createdAt: "asc" }
      : opts.sort === "name"
      ? { name: "asc" }
      : { createdAt: "desc" };

  const [total, rows] = await Promise.all([
    prisma.profile.count({ where }),
    prisma.profile.findMany({
      where,
      include: { subscription: true },
      orderBy,
      skip,
      take: ps,
    }),
  ]);

  const items = rows.map((r): AdminUserRow => {
    const plan = deriveUserPlan(r.subscription, now);
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      disabled: r.disabled,
      planLabel: plan.planLabel,
      tier: plan.tier,
      grantType: plan.tier === "pro" ? plan.grantType : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  });

  return { items, total, page: p, pageSize: ps, pages: Math.ceil(total / ps) || 1 };
}

export async function getUserDetail(id: string) {
  const now = new Date();
  const profile = await prisma.profile.findUnique({
    where: { id },
    // Never select passwordHash or any secret.
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      disabled: true,
      createdAt: true,
      updatedAt: true,
      subscription: true,
    },
  });
  if (!profile) return null;

  const [cvCount, applicationCount, pdfExports, payments, audits] =
    await Promise.all([
      prisma.cV.count({ where: { userId: id } }),
      prisma.application.count({ where: { userId: id } }),
      prisma.exportEvent.count({ where: { userId: id, type: "PDF_DOWNLOAD" } }),
      prisma.payment.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          plan: true,
          createdAt: true,
        },
      }),
      prisma.adminAuditLog.findMany({
        where: { targetUserId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { admin: { select: { email: true, name: true } } },
      }),
    ]);

  const plan = deriveUserPlan(profile.subscription, now);
  const s = profile.subscription;

  return {
    profile: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: profile.role,
      disabled: profile.disabled,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
    plan,
    subscription: s
      ? {
          plan: s.plan,
          planName: getPlan(s.plan).name,
          status: s.status,
          provider: s.provider,
          grantType: s.grantType,
          grantReason: s.grantReason,
          startDate: s.startDate?.toISOString() ?? null,
          currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: s.cancelAtPeriodEnd,
        }
      : null,
    counts: { cvCount, applicationCount, pdfExports },
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      plan: p.plan,
      createdAt: p.createdAt.toISOString(),
    })),
    audits: audits.map((a) => ({
      id: a.id,
      action: a.action,
      admin: a.admin?.name || a.admin?.email || "admin",
      metadata: (a.metadata as Record<string, unknown>) ?? {},
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

/* ---------------- CVs ---------------- */

export async function listCVs(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
}): Promise<Page<any>> {
  const { p, ps, skip } = clampPage(opts.page, opts.pageSize);
  const q = opts.q?.trim();
  const where: Prisma.CVWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};
  const [total, rows] = await Promise.all([
    prisma.cV.count({ where }),
    prisma.cV.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: ps,
      select: {
        id: true,
        title: true,
        template: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true, name: true } },
        _count: { select: { exportEvents: true } },
      },
    }),
  ]);
  const items = rows.map((r) => ({
    id: r.id,
    title: r.title,
    template: r.template,
    owner: r.user?.name || r.user?.email || "—",
    ownerEmail: r.user?.email ?? "",
    downloads: r._count.exportEvents,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
  return { items, total, page: p, pageSize: ps, pages: Math.ceil(total / ps) || 1 };
}

/* ---------------- Applications ---------------- */

export async function listApplications(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
}): Promise<Page<any>> {
  const { p, ps, skip } = clampPage(opts.page, opts.pageSize);
  const q = opts.q?.trim();
  const where: Prisma.ApplicationWhereInput = {};
  if (q)
    where.OR = [
      { companyName: { contains: q, mode: "insensitive" } },
      { jobTitle: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  if (opts.status && opts.status !== "all") where.status = opts.status;

  const [total, rows] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: ps,
      select: {
        id: true,
        companyName: true,
        jobTitle: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true, name: true } },
      },
    }),
  ]);
  const items = rows.map((r) => ({
    id: r.id,
    companyName: r.companyName,
    jobTitle: r.jobTitle,
    status: r.status,
    owner: r.user?.name || r.user?.email || "—",
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
  return { items, total, page: p, pageSize: ps, pages: Math.ceil(total / ps) || 1 };
}

/* ---------------- Subscriptions ---------------- */

export async function listSubscriptions(opts: {
  page?: number;
  pageSize?: number;
  filter?: string;
}): Promise<Page<any>> {
  const { p, ps, skip } = clampPage(opts.page, opts.pageSize);
  const where: Prisma.SubscriptionWhereInput = {};
  switch (opts.filter) {
    case "active":
      where.status = "ACTIVE";
      break;
    case "canceled":
      where.cancelAtPeriodEnd = true;
      break;
    case "expired":
      where.status = "EXPIRED";
      break;
    case "past_due":
      where.status = "PAST_DUE";
      break;
    case "admin":
      where.grantType = "admin";
      break;
  }
  const [total, rows] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ps,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);
  const items = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    owner: r.user?.name || r.user?.email || "—",
    plan: getPlan(r.plan).name,
    planId: r.plan,
    status: r.status,
    grantType: r.grantType,
    provider: r.provider || (r.grantType === "admin" ? "admin" : "—"),
    cancelAtPeriodEnd: r.cancelAtPeriodEnd,
    startDate: r.startDate?.toISOString() ?? null,
    currentPeriodEnd: r.currentPeriodEnd?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
  return { items, total, page: p, pageSize: ps, pages: Math.ceil(total / ps) || 1 };
}

/* ---------------- Payments ---------------- */

export async function listPayments(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
}): Promise<Page<any>> {
  const { p, ps, skip } = clampPage(opts.page, opts.pageSize);
  const q = opts.q?.trim();
  const where: Prisma.PaymentWhereInput = {};
  if (q)
    where.OR = [
      { transactionId: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  if (opts.status && opts.status !== "all") where.status = opts.status.toUpperCase();

  const [total, rows] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ps,
      select: {
        id: true,
        transactionId: true,
        amount: true,
        currency: true,
        status: true,
        plan: true,
        provider: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    }),
  ]);
  const items = rows.map((r) => ({
    id: r.id,
    transactionId: r.transactionId,
    owner: r.user?.email || "—",
    amount: r.amount,
    currency: r.currency,
    status: r.status,
    plan: getPlan(r.plan).name,
    provider: r.provider || "—",
    createdAt: r.createdAt.toISOString(),
  }));
  return { items, total, page: p, pageSize: ps, pages: Math.ceil(total / ps) || 1 };
}

/* ---------------- Audit log ---------------- */

export async function listAuditLogs(opts: {
  page?: number;
  pageSize?: number;
}): Promise<Page<any>> {
  const { p, ps, skip } = clampPage(opts.page, opts.pageSize);
  const [total, rows] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: ps,
      include: {
        admin: { select: { email: true, name: true } },
        target: { select: { email: true, name: true } },
      },
    }),
  ]);
  const items = rows.map((r) => ({
    id: r.id,
    action: r.action,
    admin: r.admin?.name || r.admin?.email || "admin",
    target: r.target?.email || "—",
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: r.createdAt.toISOString(),
  }));
  return { items, total, page: p, pageSize: ps, pages: Math.ceil(total / ps) || 1 };
}
