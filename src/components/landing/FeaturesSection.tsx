export default function FeaturesSection() {
  return (
    <section className="bg-brand-bg py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-brand-ink">
          Was praxis-kennzahlen.de kann
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-brand-surface bg-white p-8">
            <h3 className="font-semibold text-brand-ink">
              Szenarien in Echtzeit
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              Regler bewegen, Überschuss sofort sehen. Keine Formeln, kein
              Excel.
            </p>
          </article>
          <article className="rounded-xl border border-brand-surface bg-white p-8">
            <h3 className="font-semibold text-brand-ink">
              GKV-Abhängigkeit verstehen
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              Wie viele Privatpatienten brauche ich? Die Antwort in Sekunden.
            </p>
          </article>
          <article className="rounded-xl border border-brand-surface bg-white p-8">
            <h3 className="font-semibold text-brand-ink">
              Personalentscheidungen durchrechnen
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              Was kostet eine neue Therapeutin wirklich – inkl. Ausfallzeiten
              und Fortbildung?
            </p>
          </article>
          <article className="rounded-xl border border-brand-surface bg-white p-8">
            <h3 className="font-semibold text-brand-ink">
              Einmalig kaufen, dauerhaft nutzen
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
              690 € einmalig. Kein Abo. Hosting 3 Jahre garantiert.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
