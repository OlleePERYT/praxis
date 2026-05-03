"use client";

import type { ReactNode } from "react";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type VergleichTabProps = {
  children: ReactNode;
  comparisonTable: ReactNode | null;
  showEmptyHint: boolean;
  rememberBusy: boolean;
  onRememberComparisonPoint: () => void | Promise<void>;
};

export function VergleichTab({
  children,
  comparisonTable,
  showEmptyHint,
  rememberBusy,
  onRememberComparisonPoint,
}: VergleichTabProps) {
  return (
    <div className="space-y-6">
      {showEmptyHint ? (
        <Card variant="default" contentClassName="p-6">
          <Eyebrow>Hinweis</Eyebrow>
          <h3 className="mb-2 mt-3 text-xl font-bold text-brand-ink">
            Vergleich starten
          </h3>
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-brand-text">
            Hier vergleichen Sie Ihre Praxis mit Vergangenheit oder Wunsch-Szenarien.
            Setzen Sie einen Vergleichspunkt für Ihre aktuellen Zahlen oder tragen Sie
            externe Referenzwerte ein, um Abweichungen sichtbar zu machen.
          </p>
          <button
            type="button"
            disabled={rememberBusy}
            onClick={() => void onRememberComparisonPoint()}
            className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {rememberBusy ? "Speichern …" : "Vergleichspunkt setzen"}
          </button>
        </Card>
      ) : null}

      {children}

      {comparisonTable}
    </div>
  );
}
