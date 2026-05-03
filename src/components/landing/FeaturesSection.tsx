import Eyebrow from "@/components/ui/Eyebrow";

function IllustrationHebel() {
  return (
    <svg viewBox="0 0 220 220" className="mx-auto h-[220px] w-full max-w-[220px]" aria-hidden>
      <defs>
        <linearGradient id="feat-bar-a" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#52B788" />
          <stop offset="100%" stopColor="#2D6A4F" />
        </linearGradient>
      </defs>
      <rect
        x="24"
        y="120"
        width="36"
        height="76"
        rx="6"
        fill="url(#feat-bar-a)"
        opacity={0.85}
      />
      <rect
        x="76"
        y="88"
        width="36"
        height="108"
        rx="6"
        fill="url(#feat-bar-a)"
      />
      <rect
        x="128"
        y="56"
        width="36"
        height="140"
        rx="6"
        fill="url(#feat-bar-a)"
        opacity={0.95}
      />
      <path
        d="M32 108 Q 90 72 188 40"
        fill="none"
        stroke="#7A8B4D"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.7}
      />
      <circle cx="188" cy="40" r="6" fill="#52B788" />
    </svg>
  );
}

function IllustrationTeam() {
  return (
    <svg viewBox="0 0 220 220" className="mx-auto h-[220px] w-full max-w-[220px]" aria-hidden>
      <defs>
        <radialGradient id="feat-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#52B788" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#52B788" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx="110" cy="118" rx="88" ry="44" fill="url(#feat-glow)" />
      <circle cx="70" cy="100" r="28" fill="#E8F5EE" stroke="#2D6A4F" strokeWidth={2} />
      <circle cx="150" cy="100" r="28" fill="#E8F5EE" stroke="#2D6A4F" strokeWidth={2} />
      <circle cx="110" cy="72" r="30" fill="#d4ecdf" stroke="#52B788" strokeWidth={2} />
      <path
        d="M70 100 Q110 130 150 100"
        fill="none"
        stroke="#94B89E"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
    </svg>
  );
}

function IllustrationAmpel() {
  return (
    <svg viewBox="0 0 220 220" className="mx-auto h-[220px] w-full max-w-[220px]" aria-hidden>
      <circle
        cx="110"
        cy="110"
        r="72"
        fill="none"
        stroke="#D5E4E4"
        strokeWidth={18}
      />
      <path
        d="M110 38 A72 72 0 1 1 109.9 38"
        fill="none"
        stroke="url(#feat-donut)"
        strokeWidth={18}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="feat-donut" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2D6A4F" />
          <stop offset="100%" stopColor="#52B788" />
        </linearGradient>
      </defs>
      <text
        x="110"
        y="122"
        textAnchor="middle"
        fill="#1e2328"
        fontSize="26"
        fontWeight={800}
        fontFamily="var(--font-sans), sans-serif"
      >
        70%
      </text>
      <circle cx="56" cy="156" r="6" fill="#E67E22" opacity={0.9} />
      <circle cx="110" cy="172" r="6" fill="#2E8B57" opacity={0.9} />
      <circle cx="164" cy="156" r="6" fill="#C0392B" opacity={0.85} />
    </svg>
  );
}

const CARDS = [
  {
    num: "01.0",
    title: "Überschuss und Personal im gleichen Bild",
    body: "Sehen Sie Personalkostenquote, Raumkosten und Therapie-Erlös – ohne Excel und ohne Wartezeit auf die nächste BWA.",
    Illustration: IllustrationHebel,
  },
  {
    num: "02.0",
    title: "Team und Erlös zusammendenken",
    body: "Verteilen Sie den Therapie-Umsatz nach effektiven Stunden und erkennen Sie, welche Rolle jede Therapeutin für die Wirtschaftlichkeit spielt.",
    Illustration: IllustrationTeam,
  },
  {
    num: "03.0",
    title: "Risiken erkennen, bevor sie ins Budget schlagen",
    body: "GKV-Anteil, Auslastung und Mix-Modell transparent darstellen – damit Sie früh gegensteuern können.",
    Illustration: IllustrationAmpel,
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="bg-brand-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Eyebrow>Was Sie damit machen</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-brand-ink md:text-5xl">
          Drei{" "}
          <span className="text-brand-primary">Hebel</span>, die zählen.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
          {CARDS.map(({ num, title, body, Illustration: Il }) => (
            <article
              key={num}
              className="group rounded-3xl border border-brand-surface bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow-md)]"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                {num}
              </p>
              <div
                className="mt-6 flex h-[220px] items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(232,245,238,0.6), rgba(237,234,227,0.5))",
                }}
              >
                <Il />
              </div>
              <h3 className="mt-6 text-[26px] font-bold leading-snug text-brand-ink">
                {title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-brand-text">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
