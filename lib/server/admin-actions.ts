import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function writeAudit(
  adminId: string,
  action: string,
  targetUserId: string | null,
  metadata: Record<string, unknown> = {}
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetUserId,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error("writeAudit failed:", err);
  }
}

export type ActionResult = { ok: true } | { ok: false; error: string };

async function targetExists(userId: string): Promise<boolean> {
  const t = await prisma.profile.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  return Boolean(t);
}

/** Manually grant Pro (admin entitlement — never a fake payment). */
export async function grantPro(
  adminId: string,
  userId: string,
  reason: string
): Promise<ActionResult> {
  if (!(await targetExists(userId)))
    return { ok: false, error: "User not found." };
  const now = new Date();
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: "pro_monthly",
      status: "ACTIVE",
      grantType: "admin",
      grantedByAdminId: adminId,
      grantReason: reason || null,
      provider: "admin",
      cancelAtPeriodEnd: false,
      currentPeriodStart: now,
      currentPeriodEnd: null,
    },
    create: {
      userId,
      plan: "pro_monthly",
      status: "ACTIVE",
      grantType: "admin",
      grantedByAdminId: adminId,
      grantReason: reason || null,
      provider: "admin",
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: null,
    },
  });
  await writeAudit(adminId, "GRANT_PRO", userId, { reason: reason || null });
  return { ok: true };
}

/** Revoke a subscription's Pro access (admin-granted or a deliberate paid revoke). */
export async function revokePro(
  adminId: string,
  userId: string,
  reason: string
): Promise<ActionResult> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return { ok: false, error: "This user has no subscription." };
  await prisma.subscription.update({
    where: { userId },
    data: { status: "EXPIRED", cancelAtPeriodEnd: false },
  });
  await writeAudit(adminId, "REVOKE_PRO", userId, {
    reason: reason || null,
    previousGrantType: sub.grantType,
    previousStatus: sub.status,
  });
  return { ok: true };
}

export async function changeRole(
  adminId: string,
  userId: string,
  role: string
): Promise<ActionResult> {
  if (role !== "USER" && role !== "ADMIN")
    return { ok: false, error: "Invalid role." };
  if (userId === adminId && role !== "ADMIN")
    return { ok: false, error: "You can't remove your own admin role." };
  const target = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return { ok: false, error: "User not found." };
  await prisma.profile.update({ where: { id: userId }, data: { role } });
  await writeAudit(adminId, "CHANGE_ROLE", userId, {
    from: target.role,
    to: role,
  });
  return { ok: true };
}

export async function setDisabled(
  adminId: string,
  userId: string,
  disabled: boolean
): Promise<ActionResult> {
  if (userId === adminId)
    return { ok: false, error: "You can't disable your own account." };
  if (!(await targetExists(userId)))
    return { ok: false, error: "User not found." };
  await prisma.profile.update({ where: { id: userId }, data: { disabled } });
  await writeAudit(
    adminId,
    disabled ? "DISABLE_USER" : "ENABLE_USER",
    userId,
    {}
  );
  return { ok: true };
}
