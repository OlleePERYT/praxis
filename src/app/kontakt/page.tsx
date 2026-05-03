import type { Metadata } from "next";
import ContactForm from "@/components/landing/ContactForm";
import { PracticeLegalShell } from "@/components/PracticeLegalShell";

export const metadata: Metadata = {
  title: "Kontakt & Support | praxis-kennzahlen.de",
  description: "Support und Kontakt zum Betreiber",
};

export default function KontaktPage() {
  return (
    <PracticeLegalShell>
      <div className="space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-brand-ink">
            {"Kontakt & Support"}
          </h1>
          <p className="text-sm text-brand-muted">
            Technische Hilfe, Feedback oder Fragen zur Nutzung: Wir melden uns
            bei Ihnen.
          </p>
        </header>
        <ContactForm variant="support" />
      </div>
    </PracticeLegalShell>
  );
}
