import Link from "next/link";
import PraxisLogo from "@/components/ui/PraxisLogo";

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-surface bg-brand-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <PraxisLogo size={28} />
          <span className="font-sans text-brand-ink">
            praxis-<span className="font-bold">kennzahlen</span>
            <span className="text-brand-primary">.de</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="text-sm text-brand-muted transition-colors hover:text-brand-primary md:text-base"
        >
          Anmelden
        </Link>
      </div>
    </header>
  );
}
