import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth/server";
import { getPlanContext } from "@/lib/server/billing";
import { PricingCards } from "@/components/billing/PricingCards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing — CVForge",
  description:
    "Simple pricing. Start free, upgrade to CVForge Pro for unlimited CVs, all templates, cover letters and more.",
};

export default async function PricingPage() {
  const user = await getAuthUser();
  const ctx = user ? await getPlanContext(user.id) : null;

  return (
    <div className="section-x py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center">Pricing</p>
        <h1 className="mt-3 text-display font-extrabold text-ink text-balance">
          Simple pricing for your job search.
        </h1>
        <p className="mt-4 text-lg text-ink-muted text-pretty">
          Start free and upgrade to Pro when you&apos;re ready for unlimited CVs,
          every template, cover letters and more.
        </p>
      </div>

      <div className="mt-12">
        <PricingCards loggedIn={Boolean(user)} isPro={Boolean(ctx?.isPro)} />
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-sm text-ink-muted">
        Prices in XAF. Your CV and application data always stays yours — even if
        you move back to the Free plan.
      </p>
    </div>
  );
}
