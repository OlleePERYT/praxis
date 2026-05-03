"use client";

import { useState } from "react";
import Eyebrow from "@/components/ui/Eyebrow";

const FAQS = [
  {
    q: "Brauche ich technisches Vorwissen?",
    a: "Nein. Wir richten alles für Sie ein. Sie loggen sich ein und ziehen Regler — das war's. Keine Installation, keine Updates, keine IT.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Alle Daten liegen auf deutschen Servern (Hetzner, Falkenstein/Nürnberg). DSGVO-konform. Keine US-Cloud dazwischen. AVV inklusive.",
  },
  {
    q: "Was ist im Preis enthalten?",
    a: "Software-Lizenz für Ihre Praxis, persönliches Onboarding (30 Min.), 3 Jahre Hosting, 12 Monate Bugfixes. Einmalig 690 €.",
  },
  {
    q: "Was, wenn ich mehrere Praxen habe?",
    a: "Eine Lizenz pro Praxis. Filialvergleich kommt in Version 1.1 als optionales Modul.",
  },
  {
    q: "Kann ich es vorher sehen?",
    a: "Ja. Im 30-min. Onboarding-Call zeigen wir Ihnen alles live mit Ihren BWA-Zahlen. Kostenlos und unverbindlich.",
  },
  {
    q: "Was ist mit Updates?",
    a: "Bugfixes 12 Monate inklusive. Neue Funktionen kommen als einzelne Module (90–190 €). Sie bezahlen nur, was Sie wirklich brauchen.",
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
              Sie haben{" "}
              <span className="accent">Fragen?</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-muted md:text-[15px]">
              Hier sind die Antworten, die uns am häufigsten erreichen. Falls
              Ihre Frage fehlt,{" "}
              <a
                href="#kontakt"
                className="font-medium text-brand-primary hover:underline"
              >
                schreiben Sie uns einfach
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
