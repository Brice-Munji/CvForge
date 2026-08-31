import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="section-x py-16 lg:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[1.6rem] bg-ink px-6 py-16 text-center sm:px-12 lg:py-24">
          {/* Tasteful background treatment */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 noise-overlay opacity-60" />
            <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-700/40 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-800/50 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.4]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, transparent, rgba(0,0,0,0.35))",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow justify-center text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Ready when you are
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.1rem)] font-extrabold leading-tight tracking-tight text-canvas text-balance">
              Your next opportunity starts with a better CV.
            </h2>
            <p className="mt-4 text-lg text-canvas/70">Create yours today.</p>
            <div className="mt-8 flex justify-center">
              <Button href="/signup" size="lg" className="group bg-white text-ink hover:bg-white hover:text-ink shadow-lift">
                Create My CV
                <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
