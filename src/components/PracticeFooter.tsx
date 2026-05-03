import Link from "next/link";

export function PracticeFooter() {
  return (
    <footer className="border-t border-[var(--color-brand-border-soft)] bg-brand-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-brand-muted">
          <span className="font-sans">
            praxis-<span className="font-bold">kennzahlen</span>
            <span className="text-brand-primary">.de</span>
          </span>
          <span> · v1.0</span>
        </p>
        <nav
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-muted"
          aria-label="Rechtliches und Hilfe"
        >
          <Link
            href="/impressum"
            className="hover:text-brand-primary"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="hover:text-brand-primary"
          >
            Datenschutz
          </Link>
          <Link href="/kontakt" className="hover:text-brand-primary">
            {"Kontakt & Support"}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
