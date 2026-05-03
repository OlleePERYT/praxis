"use client";

import { useState } from "react";
import Eyebrow from "@/components/ui/Eyebrow";

const FAQS = [
  {
    q: "Was genau ist praxis-kennzahlen.de?",
    a: "Eine webbasierte Kalkulation für Ihre Praxis: Sie stellen Wochenstunden, Löhne, Erlöse und Kosten ein und sehen sofort den voraussichtlichen Jahresüberschuss – inklusive Szenarien und einfacher Visualisierungen.",
  },
  {
    q: "Wo liegen meine Daten?",
    a: "Die Anwendung läuft auf Servern in Deutschland. Die Zuordnung erfolgt über Ihre Praxis-Subdomain; Details finden Sie in der Datenschutzerklärung.",
  },
  {
    q: "Brauche ich Buchhaltungs-Vorkenntnisse?",
    a: "Nein. Die Oberfläche ist auf Therapeutinnen und Praxisinhaber ausgelegt. Einzig die Bereitschaft, wenige Kennzahlen einzugeben, wird vorausgesetzt.",
  },
  {
    q: "Was kostet die Lizenz?",
    a: "690 € einmalig pro Praxis, ohne Abo. Hosting für drei Jahre ist eingeschlossen; danach vereinbaren wir eine schlanke Fortzahlung je nach Preisstand zu diesem Zeitpunkt.",
  },
  {
    q: "Kann ich mehrere Szenarien speichern?",
    a: "Ja – Sie können den aktuellen Stand als Szenario speichern (bis zu drei) und jederzeit mit Ihrer Baseline vergleichen.",
  },
  {
    q: "Wie läuft das Onboarding ab?",
    a: "In der Regel reichen rund 30 Minuten: Zugang, kurze Einführung, gemeinsames Befüllen der Stammdaten. Technischer Support ist über die Kontaktseite erreichbar.",
  },
] as const;

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <Eyebrow>Fragen &amp; Antworten</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-brand-ink md:text-5xl lg:text-[56px]">
              Häufig{" "}
              <span className="text-brand-primary">gestellte Fragen.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-muted">
              Wenn Ihre Frage fehlt, schreiben Sie uns über{" "}
              <a
                href="#kontakt"
                className="font-medium text-brand-primary hover:underline"
              >
                Kontakt
              </a>
              .
            </p>
          </div>

          <ul className="space-y-3">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <li
                  key={item.q}
                  className={`overflow-hidden rounded-2xl border border-transparent transition-colors ${
                    isOpen
                      ? "border-brand-primary/20 bg-brand-bg"
                      : "bg-brand-bg/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-bold text-brand-ink">
                      {item.q}
                    </span>
                    <span
                      className="shrink-0 text-xl font-light text-brand-primary"
                      aria-hidden
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-brand-text">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
