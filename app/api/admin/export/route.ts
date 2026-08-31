import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/api";
import { prisma } from "@/lib/prisma";
import { deriveUserPlan } from "@/lib/server/admin";
import { getPlan } from "@/lib/plans";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}

/** CSV export for admins — never includes passwords, tokens or secrets. */
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const type = new URL(req.url).searchParams.get("type") ?? "users";
  let csv = "";
  let filename = "export.csv";

  try {
    if (type === "users") {
      const rows = await prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
        select: {
          name: true,
          email: true,
          role: true,
          disabled: true,
          createdAt: true,
          subscription: true,
        },
      });
      csv = toCsv(
        ["Name", "Email", "Role", "Plan", "Disabled", "Created"],
        rows.map((r) => {
          const plan = deriveUserPlan(r.subscription);
          return [
            r.name ?? "",
            r.email,
            r.role,
            plan.planLabel,
            r.disabled ? "yes" : "no",
            r.createdAt.toISOString(),
          ];
        })
      );
      filename = "cvforge-users.csv";
    } else if (type === "payments") {
      const rows = await prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
        select: {
          transactionId: true,
          amount: true,
          currency: true,
          status: true,
          plan: true,
          provider: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      });
      csv = toCsv(
        ["Transaction", "Email", "Amount", "Currency", "Status", "Plan", "Provider", "Date"],
        rows.map((r) => [
          r.transactionId,
          r.user?.email ?? "",
          r.amount,
          r.currency,
          r.status,
          getPlan(r.plan).name,
          r.provider,
          r.createdAt.toISOString(),
        ])
      );
      filename = "cvforge-payments.csv";
    } else if (type === "subscriptions") {
      const rows = await prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
        include: { user: { select: { email: true } } },
      });
      csv = toCsv(
        ["Email", "Plan", "Status", "GrantType", "Provider", "Start", "PeriodEnd", "Created"],
        rows.map((r) => [
          r.user?.email ?? "",
          getPlan(r.plan).name,
          r.status,
          r.grantType,
          r.provider,
          r.startDate?.toISOString() ?? "",
          r.currentPeriodEnd?.toISOString() ?? "",
          r.createdAt.toISOString(),
        ])
      );
      filename = "cvforge-subscriptions.csv";
    } else {
      return NextResponse.json({ error: "Unknown export type." }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("GET /api/admin/export failed:", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
