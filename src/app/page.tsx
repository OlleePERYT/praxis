import ContactForm from "@/components/landing/ContactForm";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingNav from "@/components/landing/LandingNav";
import PriceSection from "@/components/landing/PriceSection";
import ProblemSection from "@/components/landing/ProblemSection";

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <PriceSection />
        <ContactForm />
      </main>
      <LandingFooter />
    </>
  );
}
