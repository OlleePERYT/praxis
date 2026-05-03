import Eyebrow from "@/components/ui/Eyebrow";

function NeutralCheckIcon() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-surface bg-brand-bg text-sm font-bold text-brand-muted"
      aria-hidden
    >
      ✓
    </span>
  );
}

function HighlightCheckIcon() {
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
        <div className="text-center">
          <Eyebrow>Was es bringt</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-brand-ink md:text-5xl">
            Ein einfaches Add-On für{" "}
            <span className="accent">Ihre Praxis</span>.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <article className="flex flex-col rounded-2xl bg-brand-bg/70 p-6 shadow-sm md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">
              Ihr Alltag
            </p>
            <h3 className="mt-2 text-xl font-bold text-brand-ink">
              Sie haben einen Steuerberater. Sie haben Ihre
              Praxisverwaltungs-Software.
            </h3>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-brand-text">
              <li className="flex gap-3">
                <NeutralCheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    BWA-Auswertungen (vom Steuerberater)
                  </strong>
                  <span className="text-brand-muted"> — Zeigt was war.</span>
                </span>
              </li>
              <li className="flex gap-3">
                <NeutralCheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Termin- und Patientenverwaltung
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — Läuft im Tagesgeschäft.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <NeutralCheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Erfahrung &amp; Bauchgefühl
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — Trägt Sie durch viele Entscheidungen.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <NeutralCheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Ihre Praxiszahlen im Kopf
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — Sie kennen Ihre Praxis am besten.
                  </span>
                </span>
              </li>
            </ul>
          </article>

          <div className="flex items-center justify-center py-4 lg:py-0">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-[#52B788] text-xl font-bold text-white shadow-[var(--shadow-glow-md)]"
              aria-hidden
            >
              +
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
              Was-wäre-wenn auf Knopfdruck.
            </h3>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-brand-text">
              <li className="flex gap-3">
                <HighlightCheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Szenarien live durchspielen
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — Regler ziehen, Wirkung sofort sehen.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <HighlightCheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Personal-Entscheidungen prüfen
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — Lohnt sich Therapeut:in 3? Sie wissen es.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <HighlightCheckIcon />
                <span>
                  <strong className="text-brand-ink">Erlös-Mix verstehen</strong>
                  <span className="text-brand-muted">
                    {" "}
                    — GKV, PKV, Selbstzahler — auf einen Blick.
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <HighlightCheckIcon />
                <span>
                  <strong className="text-brand-ink">
                    Ohne Excel, ohne Schulung
                  </strong>
                  <span className="text-brand-muted">
                    {" "}
                    — Wir richten alles ein. Sie nutzen es.
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
