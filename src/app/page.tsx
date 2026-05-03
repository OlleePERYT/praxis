import CTABand from "@/components/landing/CTABand";
import CompareSection from "@/components/landing/CompareSection";
import ContactForm from "@/components/landing/ContactForm";
import FAQSection from "@/components/landing/FAQSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Hero from "@/components/landing/Hero";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingNav from "@/components/landing/LandingNav";
import TrustStrip from "@/components/landing/TrustStrip";

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <TrustStrip />
        <CompareSection />
        <FeaturesSection />
        <FAQSection />
        <CTABand />
        <ContactForm />
      </main>
      <LandingFooter />
    </>
  );
}
