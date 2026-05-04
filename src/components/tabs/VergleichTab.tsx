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

type StoredVergleichView = {
  order?: string[];
  hidden?: string[];
};

function parseStoredView(raw: string | null): { order: string[]; hidden: string[] } {
  if (!raw) return { order: [], hidden: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return {
        order: parsed.filter((x): x is string => typeof x === "string"),
        hidden: [],
      };
    }
    if (parsed && typeof parsed === "object") {
      const o = parsed as StoredVergleichView;
      const order = Array.isArray(o.order)
        ? o.order.filter((x): x is string => typeof x === "string")
        : [];
      const hidden = Array.isArray(o.hidden)
        ? o.hidden.filter((x): x is string => typeof x === "string")
        : [];
      return { order, hidden };
    }
  } catch {
    /* corrupt storage */
  }
  return { order: [], hidden: [] };
}

function stringifyView(order: string[], hidden: string[]): string {
  return JSON.stringify({ order, hidden });
}

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
  /** Gespeicherte Szenarien, die nicht gelöscht sind, aber nicht in Diagramm/Tabelle erscheinen sollen. */
  const [hiddenScenarioIds, setHiddenScenarioIds] = useState<string[]>([]);
  const [viewPrefsHydrated, setViewPrefsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(comparisonScenarioColumnStorageKey);
      const { order, hidden } = parseStoredView(raw);
      if (order.length > 0) setSavedColumnOrder(order);
      if (hidden.length > 0) setHiddenScenarioIds(hidden);
    } catch {
      /* ignore */
    }
    setViewPrefsHydrated(true);
  }, [comparisonScenarioColumnStorageKey]);

  const normalizedSavedIds = useMemo(() => savedRows.map((r) => r.id), [savedRows]);

  useEffect(() => {
    if (!viewPrefsHydrated) return;
    if (normalizedSavedIds.length === 0) return;
    setHiddenScenarioIds((prev) =>
      prev.filter((id) => normalizedSavedIds.includes(id)),
    );
  }, [normalizedSavedIds, viewPrefsHydrated]);

  useEffect(() => {
    if (!viewPrefsHydrated) return;
    try {
      localStorage.setItem(
        comparisonScenarioColumnStorageKey,
        stringifyView(savedColumnOrder, hiddenScenarioIds),
      );
    } catch {
      /* Quota oder Private Mode */
    }
  }, [
    viewPrefsHydrated,
    comparisonScenarioColumnStorageKey,
    savedColumnOrder,
    hiddenScenarioIds,
  ]);

  const effectiveSavedIds = useMemo(() => {
    const ordered = savedColumnOrder.filter((id) => normalizedSavedIds.includes(id));
    const missing = normalizedSavedIds.filter((id) => !ordered.includes(id));
    return [...ordered, ...missing];
  }, [normalizedSavedIds, savedColumnOrder]);

  const hiddenSet = useMemo(() => new Set(hiddenScenarioIds), [hiddenScenarioIds]);

  const comparisonScenarios = useMemo(() => {
    const byId = new Map(savedRows.map((r) => [r.id, r]));
    const orderedSaved = effectiveSavedIds
      .filter((id) => !hiddenSet.has(id))
      .map((id) => byId.get(id))
      .filter((r): r is ScenarioComparisonTableRow => r !== undefined);
    return [currentRow, ...orderedSaved];
  }, [currentRow, savedRows, effectiveSavedIds, hiddenSet]);

  const hiddenSavedRows = useMemo(
    () => savedRows.filter((r) => hiddenSet.has(r.id)),
    [savedRows, hiddenSet],
  );

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
        return next;
      });
    },
    [savedRows],
  );

  const excludeScenarioFromComparison = useCallback((scenarioId: string) => {
    setHiddenScenarioIds((prev) =>
      prev.includes(scenarioId) ? prev : [...prev, scenarioId],
    );
  }, []);

  const restoreScenarioToComparison = useCallback((scenarioId: string) => {
    setHiddenScenarioIds((prev) => prev.filter((id) => id !== scenarioId));
  }, []);

  const visibleSavedCount = comparisonScenarios.filter((s) => !s.isCurrent).length;

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
      <ScenarioComparisonChart
        scenarios={chartRows}
        onGoToCockpit={onGoToCockpit}
        savedScenarioTotalCount={savedRows.length}
      />

      {hiddenSavedRows.length > 0 ? (
        <div className="rounded-2xl border border-[var(--color-brand-border-soft)] bg-brand-bg/35 px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-brand-muted uppercase">
            Aus dem Vergleich ausgeblendet
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-text">
            Diese gespeicherten Szenarien sind nur aus der Übersicht und Tabelle genommen — sie
            werden nicht gelöscht. Klicken Sie, um sie wieder einzublenden.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {hiddenSavedRows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => restoreScenarioToComparison(r.id)}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-dashed border-brand-primary/35 bg-white px-3 py-1.5 text-left text-xs font-semibold text-brand-primary shadow-sm transition hover:border-brand-primary/60 hover:bg-brand-primary/5"
                title={`„${r.name}“ wieder in den Vergleich einblenden`}
                aria-label={`Szenario „${r.name}“ wieder in den Vergleich einblenden`}
              >
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 opacity-90"
                  aria-hidden
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ScenarioComparisonTable
        scenarios={comparisonScenarios}
        onGoToCockpit={onGoToCockpit}
        savedScenarioTotalCount={savedRows.length}
        onReorderScenario={
          visibleSavedCount > 1 ? moveSavedScenarioColumn : undefined
        }
        onExcludeScenario={
          savedRows.length > 0 ? excludeScenarioFromComparison : undefined
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
