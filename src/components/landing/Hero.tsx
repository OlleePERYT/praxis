export default function Hero() {
  return (
    <section className="bg-brand-bg py-24 md:py-36">
      <div className="mx-auto max-w-4xl px-4 text-left md:px-6 md:text-center">
        <h1 className="text-4xl font-bold leading-tight text-brand-ink md:text-6xl">
          Ihre Praxis. Ihre Zahlen. Ihre Entscheidungen.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-brand-text md:mx-auto md:text-xl">
          Bewegen Sie einen Regler – und sehen Sie sofort, was das für Ihren
          Jahresüberschuss bedeutet.
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
