"use client";

import type { PlanId } from "@/lib/plans";

/** Minimal plan snapshot passed from server components to client components. */
export interface ViewerPlan {
  isPro: boolean;
  planId: PlanId;
  usage: { cvCount: number; pdfExportCount: number; applicationCount: number };
  limits: {
    maxCVs: number | null;
    maxPdfExportsPerPeriod: number | null;
    maxApplications: number | null;
    coverLetters: boolean;
    premiumTemplates: boolean;
  };
}

/** Start a Pro checkout and redirect the browser to the provider. */
export async function startCheckout(
  plan: "pro_monthly" | "pro_yearly"
): Promise<{ error?: string }> {
  try {
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      return { error: b.error || "We couldn't start the payment. Please try again." };
    }
    const { checkoutUrl } = await res.json();
    window.location.href = checkoutUrl;
    return {};
  } catch {
    return { error: "Network error. Please try again." };
  }
}

/** Detect an upgrade-required response body. */
export function isUpgradeError(body: unknown): body is { error: string; code: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { code?: string }).code === "UPGRADE_REQUIRED"
  );
}
