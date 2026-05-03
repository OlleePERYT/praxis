import Eyebrow from "@/components/ui/Eyebrow";

function CrossIcon() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-sm font-bold text-rose-600"
      aria-hidden
    >
      ✕
    </span>
  );
}

function CheckIcon() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10 text-sm font-bold text-brand-primary"
      aria-hidden
    >
      ✓
    </span>
  );
}

export default function CompareSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(82,183,136,0.25), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Eyebrow>Das Problem</Eyebrow>
        <h2 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-brand-ink md:text-5xl">
          Heute führen Sie blind.{" "}
          <br className="hidden sm:block" />
          <span className="text-brand-primary">
            Morgen mit Klarheit.
          </span>
        </h2>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <article className="flex flex-col rounded-2xl bg-brand-bg/85 p-6 shadow-sm md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">
              Heute
            </p>
            <h3 className="mt-2 text-xl font-bold text-brand-ink">
              Steuerberater &amp; Bauchgefühl
            </h3>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-brand-text">
              <li className="flex gap-3">
                <CrossIcon />
                <span>
                  <strong className="text-brand-ink">BWA einmal im Quartal</strong>
                  <span className="text-brand-muted">
                    {" "}
                    — als PDF. Keine Szenarien.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <CrossIcon />
                <span>
                  <strong className="text-brand-ink">Terminsoftware regelt Termine</strong>
                  <span className="text-brand-muted">
                    {" "}
                    — strategische Auswirkungen sehen Sie nicht.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <CrossIcon />
                <span>
                  <strong className="text-brand-ink">
                    Niemand zeigt Was-wäre-wenn
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — zweite Therapeutin? Gehalt 10 % höher?
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <CrossIcon />
                <span>
                  <strong className="text-brand-ink">Entscheidungen im Nebel</strong>
                  <span className="text-brand-muted">
                    {" "}
                    — zu spät merken, dass die Kasse nicht reicht.
                  </span>
                </span>
              </li>
            </ul>
          </article>

          <div className="flex items-center justify-center py-4 lg:py-0">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white shadow-[var(--shadow-glow-md)]"
              style={{ background: "var(--gradient-primary)" }}
              aria-hidden
            >
              →
            </div>
          </div>

          <article
            className="flex flex-col rounded-2xl border-2 border-brand-primary p-6 shadow-[var(--shadow-glow-sm)] md:p-8"
            style={{
              background:
                "linear-gradient(145deg, rgba(45,106,79,0.06), rgba(82,183,136,0.10))",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-primary">
              Mit praxis-kennzahlen.de
            </p>
            <h3 className="mt-2 text-xl font-bold text-brand-ink">
              Klarheit auf Knopfdruck
            </h3>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-brand-text">
              <li className="flex gap-3">
                <CheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Sofortiger Überblick auf den Jahresüberschuss
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — nach Personal, Erlösen und Sachkosten.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <CheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Szenarien speichern und vergleichen
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — Baseline, Was-wäre-wenn, bis zu drei Pläne.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <CheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Therapie-Erlös und Personalkosten nachvollziehbar
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — transparent pro Teammitglied.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <CheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Entscheidungen mit Zahlen untermauern
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — vor dem Gespräch mit Partner oder Bank.
                  </span>
                </span>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
