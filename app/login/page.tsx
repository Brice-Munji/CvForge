"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Input, FieldGroup } from "@/components/ui/Field";
import { signInWithPassword, resendVerification } from "@/lib/auth/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const verifyState = params.get("verify"); // "invalid" from an expired/bad link
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When login is blocked because the email isn't verified, offer a resend.
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent, setResent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setNeedsVerify(false);
    setResent(false);
    setLoading(true);
    const { error, data } = await signInWithPassword(email.trim(), password);
    if (error) {
      setError(error);
      setNeedsVerify(Boolean(data?.needsVerification));
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  };

  const onResend = async () => {
    setResent(false);
    await resendVerification(email.trim());
    setResent(true);
  };

  return (
    <>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">
        Log in to CVForge
      </h1>
      <p className="mt-2 text-ink-muted">Pick up right where you left off.</p>

      {verifyState === "invalid" && !error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            That verification link is invalid or has expired. Log in to request a
            new one.
          </span>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {error}
            {needsVerify && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={onResend}
                  className="font-semibold underline hover:text-red-800"
                >
                  Resend verification email
                </button>
                .
              </>
            )}
          </span>
        </div>
      )}

      {resent && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Verification email sent. Please check your inbox.</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <FieldGroup label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FieldGroup>

        <FieldGroup label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FieldGroup>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log In"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          or
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton label="Continue with Google" onError={setError} redirectTo={redirect} />

      <p className="mt-8 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Create My CV
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell eyebrow="Welcome back">
      <Suspense fallback={<div className="mt-8 h-40" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
