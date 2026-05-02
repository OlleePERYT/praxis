export default function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Anfragen",
      body: "Formular ausfüllen. Wir melden uns innerhalb von 24 Stunden.",
    },
    {
      n: "2",
      title: "Einrichten",
      body: "Wir spielen Ihre BWA-Daten ein und richten alles ein. Sie müssen nichts tun.",
    },
    {
      n: "3",
      title: "Loslegen",
      body: "30-Minuten-Call, und Sie können sofort mit Szenarien arbeiten.",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-brand-ink">
          So funktioniert es
        </h2>
        <div className="mx-auto mt-12 md:border-t md:border-brand-surface md:pt-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <div
                key={step.n}
                className="flex flex-col items-center text-center md:-mt-12 md:pt-0"
              >
                <p className="text-4xl font-bold text-brand-primary">{step.n}</p>
                <h3 className="mt-4 font-semibold text-brand-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-text md:text-base">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
