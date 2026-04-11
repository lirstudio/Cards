"use client";

import { MarketingNavbar } from "./marketing-navbar";
import { HeroSection } from "./hero-section";
import { SocialProofBar } from "./social-proof-bar";
import { FeaturesSection } from "./features-section";
import { ShowcaseSection } from "./showcase-section";
import { HowItWorksSection } from "./how-it-works-section";
import { TestimonialsSection } from "./testimonials-section";
import { PricingSection } from "./pricing-section";
import { FaqSection } from "./faq-section";
import { FinalCtaSection } from "./final-cta-section";
import { MarketingFooter } from "./marketing-footer";

function GradientDivider() {
  return (
    <div
      aria-hidden
      className="pointer-events-none mx-auto h-px max-w-4xl"
      style={{
        background:
          "linear-gradient(to left, transparent, rgba(214,235,253,0.15) 30%, rgba(214,235,253,0.15) 70%, transparent)",
      }}
    />
  );
}

export function MarketingLanding() {
  return (
    <div className="relative min-h-full overflow-x-hidden bg-black">
      {/* Subtle grid pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10">
        <MarketingNavbar />
        <main>
          <HeroSection />
          <SocialProofBar />
          <FeaturesSection />
          <GradientDivider />
          <ShowcaseSection />
          <GradientDivider />
          <HowItWorksSection />
          <GradientDivider />
          <TestimonialsSection />
          <GradientDivider />
          <PricingSection />
          <GradientDivider />
          <FaqSection />
          <FinalCtaSection />
        </main>
        <MarketingFooter />
      </div>
    </div>
  );
}
