export default function ProblemSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-brand-ink">
          Was Ihnen heute fehlt
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="rounded-xl bg-brand-surface p-8">
            <div className="mb-4 text-[16px] leading-none" aria-hidden>
              📊
            </div>
            <h3 className="font-semibold text-brand-ink">
              Ihr Steuerberater liefert Vergangenheit.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              BWA einmal im Quartal – als PDF. Keine Szenarien, keine Zukunft.
            </p>
          </article>
          <article className="rounded-xl bg-brand-surface p-8">
            <div className="mb-4 text-[16px] leading-none" aria-hidden>
              📅
            </div>
            <h3 className="font-semibold text-brand-ink">
              Ihre Software verwaltet Termine.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              Abrechnung, Dokumentation, Terminplanung. Strategie? Fehlanzeige.
            </p>
          </article>
          <article className="rounded-xl bg-brand-surface p-8">
            <div className="mb-4 text-[16px] leading-none" aria-hidden>
              ❓
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
