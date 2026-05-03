"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  comparisonScenarioColumnStorageKey: string;
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
  comparisonScenarioColumnStorageKey,
  currentConfig,
  savedScenarios,
  onGoToCockpit,
  children,
  comparisonTable,
  showEmptyHint,
  rememberBusy,
  onRememberComparisonPoint,
}: VergleichTabProps) {
  const currentRow: ScenarioComparisonTableRow = useMemo(
    () => ({
      id: "current",
      name: "Aktuell",
      isCurrent: true,
      kpis: computeScenarioKpis(currentConfig),
    }),
    [currentConfig],
  );

  const savedRows = useMemo(() => {
    return savedScenarios.flatMap((row) => {
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
  }, [savedScenarios]);

  /** Explizite Spaltenreihenfolge nur für gespeicherte Szenarien (IDs). „Aktuell“ bleibt immer erste Datenspalte. */
  const [savedColumnOrder, setSavedColumnOrder] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(comparisonScenarioColumnStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const ids = parsed.filter((x): x is string => typeof x === "string");
      if (ids.length > 0) setSavedColumnOrder(ids);
    } catch {
      /* ignore corrupt storage */
    }
  }, [comparisonScenarioColumnStorageKey]);

  const normalizedSavedIds = useMemo(() => savedRows.map((r) => r.id), [savedRows]);

  const effectiveSavedIds = useMemo(() => {
    const ordered = savedColumnOrder.filter((id) => normalizedSavedIds.includes(id));
    const missing = normalizedSavedIds.filter((id) => !ordered.includes(id));
    return [...ordered, ...missing];
  }, [normalizedSavedIds, savedColumnOrder]);

  const comparisonScenarios = useMemo(() => {
    const byId = new Map(savedRows.map((r) => [r.id, r]));
    const orderedSaved = effectiveSavedIds
      .map((id) => byId.get(id))
      .filter((r): r is ScenarioComparisonTableRow => r !== undefined);
    return [currentRow, ...orderedSaved];
  }, [currentRow, savedRows, effectiveSavedIds]);

  const moveSavedScenarioColumn = useCallback(
    (scenarioId: string, direction: "left" | "right") => {
      setSavedColumnOrder((prev) => {
        const ids = savedRows.map((r) => r.id);
        let order = prev.filter((id) => ids.includes(id));
        for (const id of ids) {
          if (!order.includes(id)) order.push(id);
        }
        const idx = order.indexOf(scenarioId);
        if (idx < 0) return order;
        const next = [...order];
        if (direction === "left" && idx > 0) {
          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        } else if (direction === "right" && idx < next.length - 1) {
          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        }
        try {
          localStorage.setItem(comparisonScenarioColumnStorageKey, JSON.stringify(next));
        } catch {
          /* Quota oder Private Mode */
        }
        return next;
      });
    },
    [comparisonScenarioColumnStorageKey, savedRows],
  );

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
      <ScenarioComparisonTable
        scenarios={comparisonScenarios}
        onGoToCockpit={onGoToCockpit}
        onReorderScenario={
          savedRows.length > 1 ? moveSavedScenarioColumn : undefined
        }
      />

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
