"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Input, FieldGroup } from "@/components/ui/Field";
import { setUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const name = email.split("@")[0]?.replace(/[._-]/g, " ") || "there";
    setUser({ name: name.replace(/\b\w/g, (c) => c.toUpperCase()), email });
    router.push("/dashboard");
  };

  return (
    <AuthShell eyebrow="Welcome back">
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">
        Log in to CVForge
      </h1>
      <p className="mt-2 text-ink-muted">
        Pick up right where you left off.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
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

      <GoogleButton label="Continue with Google" />

      <p className="mt-8 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Create My CV
        </Link>
      </p>
    </AuthShell>
  );
}
