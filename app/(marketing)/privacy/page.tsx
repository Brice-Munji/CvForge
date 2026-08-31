import Link from "next/link";

export const metadata = { title: "Privacy — CVForge" };

export default function PrivacyPage() {
  return (
    <div className="section-x py-20 lg:py-28">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-3 text-heading font-extrabold text-ink">
          Privacy Policy
        </h1>
        <p className="mt-4 text-ink-muted">
          This is a placeholder page. A full privacy policy will be published
          before CVForge launches publicly. Your CV content stays yours — we
          build tools to help you create and manage it.
        </p>
        <div className="mt-8 space-y-4 text-ink-soft">
          <p>
            We will clearly explain what information we collect, how it is used,
            and the choices you have. Nothing here should be treated as a final
            legal agreement during this early build.
          </p>
          <p>
            Questions in the meantime? Head back to the{" "}
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
