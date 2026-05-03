import Link from "next/link";
import PraxisLogo from "@/components/ui/PraxisLogo";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[var(--color-brand-border-soft)] bg-brand-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6">
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-4 md:text-left">
          <Link href="/" className="flex items-center gap-2">
            <PraxisLogo size={24} />
            <span className="text-sm text-brand-ink">
              praxis-<span className="font-bold">kennzahlen</span>
              <span className="text-brand-primary">.de</span>
            </span>
          </Link>
          <p className="text-xs text-brand-muted">
            © {new Date().getFullYear()} praxis-kennzahlen.de
          </p>
        </div>
        <nav
          className="flex flex-wrap justify-center gap-x-8 gap-y-2 md:justify-end"
          aria-label="Rechtliches und Hilfe"
        >
          <Link
            href="/impressum"
            className="text-sm text-brand-muted transition-colors hover:text-brand-primary"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="text-sm text-brand-muted transition-colors hover:text-brand-primary"
          >
            Datenschutz
          </Link>
          <Link
            href="/kontakt"
            className="text-sm text-brand-muted transition-colors hover:text-brand-primary"
          >
            Hilfe
          </Link>
        </nav>
      </div>
    </footer>
  );
}
