import type { Metadata } from "next";
import Link from "next/link";
import { PracticeLegalShell } from "@/components/PracticeLegalShell";

export const metadata: Metadata = {
  title: "Datenschutz | praxis-kennzahlen.de",
  description: "Datenschutzhinweise",
};

export default function DatenschutzPage() {
  return (
    <PracticeLegalShell>
      <article className="space-y-6 text-brand-text">
        <h1 className="text-2xl font-bold text-brand-ink">
          Datenschutzhinweise
        </h1>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-brand-ink">
            Verantwortlicher
          </h2>
          <p>
            Verantwortlich für die Datenverarbeitung im Rahmen dieser Website ist
            der Betreiber von{" "}
            <strong>praxis-kennzahlen.de</strong>. Erreichbarkeit und Support:
            siehe{" "}
            <Link href="/kontakt" className="font-medium text-brand-primary hover:underline">
              {"Kontakt & Support"}
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-brand-ink">
            Zwecke der Verarbeitung
          </h2>
          <p>
            Wir verarbeiten personenbezogene Daten nur im Rahmen der
            Bereitstellung der Anwendung (z.&nbsp;B. Login, Mandantenzuordnung),
            zur Kommunikation bei Supportanfragen sowie soweit gesetzliche
            Pflichten bestehen.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-brand-ink">Ihre Rechte</h2>
          <p>
            Sie haben insbesondere Rechte auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und
            Widerspruch, soweit die jeweiligen Voraussetzungen der DSGVO
            erfüllt sind. Wenden Sie sich dazu bitte an den Support unter{" "}
            <Link href="/kontakt" className="font-medium text-brand-primary hover:underline">
              {"Kontakt & Support"}
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-brand-ink">
            Änderungen dieser Hinweise
          </h2>
          <p>
            Wir können diese Hinweise bei Bedarf anpassen. Maßgeblich ist die
            jeweils veröffentlichte Fassung auf dieser Seite.
          </p>
        </section>
      </article>
    </PracticeLegalShell>
  );
}
