import { Hero } from "@/components/marketing/Hero";
import { SocialProof } from "@/components/marketing/SocialProof";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { Templates } from "@/components/marketing/Templates";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Features } from "@/components/marketing/Features";
import { Audience } from "@/components/marketing/Audience";
import { CTASection } from "@/components/marketing/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <ProductPreview />
      <Templates />
      <HowItWorks />
      <Features />
      <Audience />
      <CTASection />
    </>
  );
}
