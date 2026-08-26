import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 font-display text-6xl font-extrabold tracking-tight text-ink">
        404
      </p>
      <h1 className="mt-3 text-heading font-bold text-ink">
        This page took a different path.
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/">Back to home</Button>
        <Button href="/builder/new" variant="secondary">
          Create a CV
        </Button>
      </div>
    </div>
  );
}
