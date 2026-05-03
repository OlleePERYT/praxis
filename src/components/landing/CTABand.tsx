import Link from "next/link";

export default function CTABand() {
  return (
    <section
      className="border-t border-brand-primary/15 py-24 md:py-[100px]"
      style={{
        background: `
          radial-gradient(ellipse 80% 70% at 50% 40%, rgba(82,183,136,0.25), transparent 55%),
          linear-gradient(180deg, #E8F5EE 0%, #F6F4EF 45%, #d4ecdf 100%)
        `,
      }}
    >
      <div className="mx-auto max-w-2xl px-4 text-center md:px-6">
        <h2 className="text-4xl font-extrabold leading-tight text-brand-ink md:text-[48px]">
          Lohnt sich das für{" "}
          <span className="text-brand-primary">Ihre Praxis?</span>
        </h2>
        <p className="mt-4 text-lg text-brand-text md:text-xl">
          30 Minuten Gespräch. Kostenlos. Wir zeigen es Ihnen mit Ihren Zahlen.
        </p>
        <Link
          href="#kontakt"
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-[#3a8763] px-10 py-4 text-base font-semibold text-white shadow-[var(--shadow-glow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-md)]"
        >
          Jetzt anfragen →
        </Link>
      </div>
    </section>
  );
}
