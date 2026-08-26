"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Input, FieldGroup } from "@/components/ui/Field";
import { setUser } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUser({ name: name.trim() || "there", email });
    router.push("/dashboard");
  };

  return (
    <AuthShell eyebrow="Get started free">
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">
        Create your account
      </h1>
      <p className="mt-2 text-ink-muted">
        Build your first CV in minutes — no card required.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
            placeholder="Create a password"
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

      <GoogleButton label="Continue with Google" />

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
