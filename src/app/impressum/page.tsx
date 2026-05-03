import type { Metadata } from "next";
import Link from "next/link";
import { PracticeLegalShell } from "@/components/PracticeLegalShell";

const support =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@praxis-kennzahlen.de";

export const metadata: Metadata = {
  title: "Impressum | praxis-kennzahlen.de",
  description: "Impressum und Anbieterkennzeichnung",
};

export default function ImpressumPage() {
  return (
    <PracticeLegalShell>
      <article className="space-y-6 text-brand-text">
        <h1 className="text-2xl font-bold text-brand-ink">Impressum</h1>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-brand-ink">
            Angaben gemäß § 5 TMG
          </h2>
          <p>
            Verantwortlich für das Informationsangebot unter der Domain{" "}
            <strong>praxis-kennzahlen.de</strong> sowie für die jeweiligen
            Praxis-Instanzen unter den zugeordneten Subdomains ist der dort
            angegebene Betreiber der Plattform.
          </p>
          <p>
            Kontakt für Support und vertragliche Anfragen: Bitte nutzen Sie die
            Seite{" "}
            <Link href="/kontakt" className="font-medium text-brand-primary hover:underline">
              {"Kontakt & Support"}
            </Link>{" "}
            oder schreiben Sie an{" "}
            <a
              href={`mailto:${support}`}
              className="font-medium text-brand-primary hover:underline"
            >
              {support}
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-brand-ink">
            Haftung für Inhalte und Links
          </h2>
          <p>
            Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die
            Richtigkeit, Vollständigkeit und Aktualität übernehmen wir keine
            Gewähr. Bei Streitfragen wenden Sie sich bitte an den Support unter
            den genannten Kontaktmöglichkeiten.
          </p>
        </section>
      </article>
    </PracticeLegalShell>
  );
}
