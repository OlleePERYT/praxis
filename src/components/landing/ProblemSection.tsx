export default function ProblemSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-brand-ink">
          Was Ihnen heute fehlt
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="rounded-xl bg-brand-surface p-8">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-primary"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="font-semibold text-brand-ink">
              Ihr Steuerberater liefert Vergangenheit.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              BWA einmal im Quartal – als PDF. Keine Szenarien, keine Zukunft.
            </p>
          </article>
          <article className="rounded-xl bg-brand-surface p-8">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-primary"
                aria-hidden
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="font-semibold text-brand-ink">
              Ihre Software verwaltet Termine.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              Abrechnung, Dokumentation, Terminplanung. Strategie? Fehlanzeige.
            </p>
          </article>
          <article className="rounded-xl bg-brand-surface p-8">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-primary"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="font-semibold text-brand-ink">
              Niemand zeigt Ihnen Was-wäre-wenn.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              Was bringt eine weitere Therapeutin? Was kostet eine Gehaltserhöhung
              wirklich?
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
