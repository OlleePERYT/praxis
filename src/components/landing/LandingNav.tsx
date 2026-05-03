import Link from "next/link";
import PraxisLogo from "@/components/ui/PraxisLogo";

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-brand-border-soft)] bg-brand-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <PraxisLogo size={28} />
          <span className="font-sans text-brand-ink">
            praxis-<span className="font-bold">kennzahlen</span>
            <span className="text-brand-primary">.de</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
