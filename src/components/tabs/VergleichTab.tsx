"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { ScenarioComparisonChart } from "@/components/ScenarioComparisonChart";
import type { ScenarioComparisonTableRow } from "@/components/ScenarioComparisonTable";
import { ScenarioComparisonTable } from "@/components/ScenarioComparisonTable";
import type { ScenarioDto } from "@/components/ScenarioPanel";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { PraxisConfig } from "@/lib/engine";
import { computeScenarioKpis } from "@/lib/engine";
import { normalizePraxisConfig } from "@/lib/praxis-config";

type VergleichTabProps = {
  currentConfig: PraxisConfig;
  savedScenarios: ScenarioDto[];
  onGoToCockpit: () => void;
  children: ReactNode;
  comparisonTable: ReactNode | null;
  showEmptyHint: boolean;
  rememberBusy: boolean;
  onRememberComparisonPoint: () => void | Promise<void>;
};

export function VergleichTab({
  currentConfig,
  savedScenarios,
  onGoToCockpit,
  children,
  comparisonTable,
  showEmptyHint,
  rememberBusy,
  onRememberComparisonPoint,
}: VergleichTabProps) {
  const comparisonScenarios: ScenarioComparisonTableRow[] = useMemo(() => {
    const currentRow: ScenarioComparisonTableRow = {
      id: "current",
      name: "Aktuell",
      isCurrent: true,
      kpis: computeScenarioKpis(currentConfig),
    };

    const rest = savedScenarios.flatMap((row) => {
      try {
        const raw = JSON.parse(row.data) as unknown;
        const cfg = normalizePraxisConfig(raw);
        const rowOut: ScenarioComparisonTableRow = {
          id: String(row.id),
          name: row.name,
          isCurrent: false,
          kpis: computeScenarioKpis(cfg),
        };
        return [rowOut];
      } catch {
        return [];
      }
    });

    return [currentRow, ...rest];
  }, [currentConfig, savedScenarios]);

  const chartRows = useMemo(
    () =>
      comparisonScenarios.map((s) => ({
        id: s.id,
        name: s.name,
        ueberschuss: s.kpis.ueberschuss,
        isCurrent: s.isCurrent,
      })),
    [comparisonScenarios],
  );

  return (
    <div className="space-y-6">
      <ScenarioComparisonChart scenarios={chartRows} onGoToCockpit={onGoToCockpit} />
      <ScenarioComparisonTable scenarios={comparisonScenarios} onGoToCockpit={onGoToCockpit} />

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
