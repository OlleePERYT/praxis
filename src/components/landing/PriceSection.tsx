export default function PriceSection() {
  const items = [
    "Einrichtung durch uns (30–60 Min. Onboarding)",
    "Eigene Subdomain auf praxis-kennzahlen.de",
    "Hosting 3 Jahre garantiert",
    "Bugfixes 12 Monate inklusive",
    "Eine Lizenz = eine Betriebsstätte",
  ];

  return (
    <section className="bg-brand-surface py-20">
      <div className="mx-auto max-w-lg px-4 text-center md:px-6">
        <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          <span className="text-5xl font-bold text-brand-ink">690 €</span>
          <span className="text-lg text-brand-muted">einmalig</span>
        </div>
        <ul className="mx-auto mt-10 max-w-md space-y-4 text-left">
          {items.map((line) => (
            <li key={line} className="flex gap-3 text-brand-text">
              <span className="shrink-0 font-semibold text-brand-primary">
                ✓
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-brand-muted">
          Kein Abo. Keine versteckten Kosten. Updates sind separate Module.
        </p>
        <a
          href="#kontakt"
          className="mt-10 inline-block rounded-lg bg-brand-primary px-8 py-4 font-semibold text-white transition-colors hover:bg-brand-accent"
        >
          Jetzt anfragen →
        </a>
      </div>
    </section>
  );
}
