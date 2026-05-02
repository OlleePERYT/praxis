import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-brand-surface bg-brand-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <p className="text-sm text-brand-text">
          © 2026 praxis-kennzahlen.de
        </p>
        <nav
          className="flex flex-wrap justify-center gap-x-8 gap-y-2 md:justify-end"
          aria-label="Rechtliches"
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
        </nav>
      </div>
    </footer>
  );
}
