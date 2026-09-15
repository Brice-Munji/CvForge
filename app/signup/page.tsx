"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Input, FieldGroup } from "@/components/ui/Field";
import { signUpWithPassword, resendVerification } from "@/lib/auth/client";
import { isValidEmail, EMAIL_INVALID_MESSAGE } from "@/lib/validation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the account is created and a verification email has been sent.
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!name.trim()) return setError("Please enter your full name.");
    if (!isValidEmail(email)) return setError(EMAIL_INVALID_MESSAGE);
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    const { error, data } = await signUpWithPassword(
      name.trim(),
      email.trim(),
      password
    );
    if (error) {
      setError(error);
      setLoading(false);
      return;
    }
    // Account created — wait for email confirmation before any session exists.
    setSentTo((data?.email as string) || email.trim());
    setLoading(false);
  };

  const onResend = async () => {
    if (!sentTo) return;
    setResent(false);
    await resendVerification(sentTo);
    setResent(true);
  };

  if (sentTo) {
    return (
      <AuthShell eyebrow="Almost there">
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600">
            <MailCheck className="h-5 w-5" />
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Verify your email
          </h1>
        </div>
        <p className="mt-4 text-ink-muted">
          We&apos;ve sent a verification link to{" "}
          <span className="font-semibold text-ink">{sentTo}</span>. Click the link
          in that email to activate your account, then log in.
        </p>

        {resent && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
            Verification email sent again. Please check your inbox.
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Button size="lg" className="w-full" onClick={onResend}>
            Resend verification email
          </Button>
          <Link href="/login" className="block">
            <Button variant="secondary" size="lg" className="w-full">
              Go to log in
            </Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Get started free">
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">
        Create your account
      </h1>
      <p className="mt-2 text-ink-muted">
        Build your first CV in minutes — no card required.
      </p>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <FieldGroup label="Full name" htmlFor="name">
          <Input
            id="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Alex Mbarga"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FieldGroup>

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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FieldGroup>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          or
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton label="Continue with Google" onError={setError} />

      <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline hover:text-ink-muted">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-ink-muted">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
