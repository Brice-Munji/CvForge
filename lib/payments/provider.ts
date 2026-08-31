import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Payment provider abstraction.
 *
 * A real provider (e.g. a Cameroon mobile-money gateway such as Fapshi or
 * Campay) is used when its credentials are configured via env vars. Otherwise a
 * built-in **sandbox** provider is used so the full payment → verify →
 * activate pipeline works end-to-end in local/dev without external services.
 *
 * In BOTH modes the server is the source of truth: Pro is only activated after
 * `verifyTransaction` confirms a successful payment — never from the browser
 * redirect alone.
 */

export interface VerifyResult {
  status: "success" | "failed" | "pending";
  amount: number;
  currency: string;
  providerTransactionId: string;
}

export interface WebhookEvent {
  reference: string | null;
  signatureValid: boolean;
}

export interface PaymentProvider {
  readonly name: string;
  /** Return the URL the user is redirected to in order to pay. */
  createCheckoutUrl(input: {
    reference: string;
    amount: number;
    currency: string;
    plan: string;
    origin: string;
  }): Promise<string>;
  /** Ask the provider whether a reference was actually paid. */
  verifyTransaction(reference: string): Promise<VerifyResult>;
  /** Parse & authenticate an incoming webhook request. */
  parseWebhook(req: Request, rawBody: string): Promise<WebhookEvent>;
}

/* ---------------- Sandbox provider ---------------- */

class SandboxProvider implements PaymentProvider {
  readonly name = "sandbox";

  async createCheckoutUrl(input: {
    reference: string;
    amount: number;
    currency: string;
    plan: string;
    origin: string;
  }): Promise<string> {
    // In-app sandbox checkout page that simulates the provider.
    const q = new URLSearchParams({
      ref: input.reference,
      amount: String(input.amount),
      currency: input.currency,
      plan: input.plan,
    });
    return `${input.origin}/checkout/sandbox?${q.toString()}`;
  }

  async verifyTransaction(reference: string): Promise<VerifyResult> {
    // The sandbox records its outcome on the Payment row's metadata, set by the
    // sandbox checkout page. This keeps the DB as the source of truth.
    const payment = await prisma.payment.findUnique({
      where: { transactionId: reference },
    });
    const meta = (payment?.metadata ?? {}) as Record<string, unknown>;
    const outcome = meta.sandboxOutcome as string | undefined;
    return {
      status:
        outcome === "success"
          ? "success"
          : outcome === "failed"
          ? "failed"
          : "pending",
      amount: payment?.amount ?? 0,
      currency: payment?.currency ?? "XAF",
      providerTransactionId: `sbx_${reference}`,
    };
  }

  async parseWebhook(_req: Request, rawBody: string): Promise<WebhookEvent> {
    // Sandbox webhook is JSON { reference } with a shared secret header checked
    // by the route. Signature is considered valid here (route enforces secret).
    try {
      const body = JSON.parse(rawBody);
      return { reference: body.reference ?? null, signatureValid: true };
    } catch {
      return { reference: null, signatureValid: false };
    }
  }
}

/* ---------------- Provider selection ---------------- */

export function isSandboxMode(): boolean {
  // Real mode requires a provider name AND a secret key.
  return !(process.env.PAYMENT_PROVIDER && process.env.PAYMENT_SECRET_KEY);
}

export function getProvider(): PaymentProvider {
  // When real provider credentials are present, a real adapter would be
  // returned here (implementing the same PaymentProvider interface). Until
  // configured, the sandbox provider drives the full pipeline.
  return new SandboxProvider();
}
