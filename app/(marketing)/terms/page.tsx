import Link from "next/link";

export const metadata = { title: "Terms — CVForge" };

export default function TermsPage() {
  return (
    <div className="section-x py-20 lg:py-28">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-3 text-heading font-extrabold text-ink">
          Terms of Service
        </h1>
        <p className="mt-4 text-ink-muted">
          This is a placeholder page. Full terms of service will be published
          before CVForge launches publicly.
        </p>
        <div className="mt-8 space-y-4 text-ink-soft">
          <p>
            By using this early build you understand that features are still in
            active development and may change. We&apos;ll keep this page updated
            as the product matures.
          </p>
          <p>
            Return to the{" "}
            <Link href="/" className="font-semibold text-brand-600 hover:text-brand-700">
              homepage
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
