import "server-only";
import { prisma } from "@/lib/prisma";
import { clampString } from "@/lib/validation";

const S = clampString;

export interface ApplicationEmailItem {
  id: string;
  applicationId: string | null;
  subject: string;
  content: string;
  updatedAt: string;
}

function toItem(row: {
  id: string;
  applicationId: string | null;
  subject: string;
  content: string;
  updatedAt: Date;
}): ApplicationEmailItem {
  return {
    id: row.id,
    applicationId: row.applicationId,
    subject: row.subject,
    content: row.content,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createApplicationEmail(
  userId: string,
  input: { applicationId?: string | null; subject: string; content: string }
): Promise<ApplicationEmailItem | { error: "app_not_found" | "email_exists" }> {
  let applicationId: string | null = null;
  if (input.applicationId) {
    const app = await prisma.application.findFirst({
      where: { id: input.applicationId, userId },
      select: { id: true, email: { select: { id: true } } },
    });
    if (!app) return { error: "app_not_found" };
    if (app.email) return { error: "email_exists" };
    applicationId = app.id;
  }

  const row = await prisma.applicationEmail.create({
    data: {
      userId,
      applicationId,
      subject: S(input.subject, 300),
      content: S(input.content, 20000),
    },
  });
  return toItem(row);
}

export async function getOwnedApplicationEmail(
  userId: string,
  id: string
): Promise<ApplicationEmailItem | null> {
  const row = await prisma.applicationEmail.findFirst({
    where: { id, userId },
  });
  return row ? toItem(row) : null;
}

export async function updateApplicationEmail(
  userId: string,
  id: string,
  body: { subject?: string; content?: string }
): Promise<{ updatedAt: string } | null> {
  const owned = await prisma.applicationEmail.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return null;
  const row = await prisma.applicationEmail.update({
    where: { id },
    data: {
      ...(body.subject !== undefined ? { subject: S(body.subject, 300) } : {}),
      ...(body.content !== undefined ? { content: S(body.content, 20000) } : {}),
    },
    select: { updatedAt: true },
  });
  return { updatedAt: row.updatedAt.toISOString() };
}

export async function deleteApplicationEmail(
  userId: string,
  id: string
): Promise<boolean> {
  const res = await prisma.applicationEmail.deleteMany({ where: { id, userId } });
  return res.count > 0;
}
