"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComparisonTable } from "./ComparisonTable";
import { EmployeeCard } from "./EmployeeCard";
import { KpiBar } from "./KpiBar";
import { MetricsCard } from "./MetricsCard";
import { PraxisCharts } from "./PraxisCharts";
import { ProfitLoss } from "./ProfitLoss";
import { RevenuePanel } from "./RevenuePanel";
import { SachkostenInner } from "./SachkostenInner";
import { ScenarioPanel } from "./ScenarioPanel";
import { StepSlider } from "./StepSlider";
import Card from "./ui/Card";
import Eyebrow from "./ui/Eyebrow";
import { defaultEmployee, normalizePraxisConfig } from "@/lib/praxis-config";
import type {
  Employee,
  PraxisConfig,
  PraxisResult,
  RevenueConfigDirect,
  RevenueConfigMix,
  SachkostenConfig,
} from "@/lib/engine";
import { calculatePraxis } from "@/lib/engine";

const SOFT_LIMIT = 25;

type Baseline = {
  config: PraxisConfig;
  result: PraxisResult;
  savedAt: string;
};

function formatBaselineLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("de-DE");
}

type SimulatorClientProps = {
  initialConfig: PraxisConfig;
};

export function SimulatorClient({ initialConfig }: SimulatorClientProps) {
  const [config, setConfig] = useState<PraxisConfig>(initialConfig);
  const [expanded, setExpanded] = useState<boolean[]>(() =>
    initialConfig.employees.map(() => false),
  );
  const [baseline, setBaseline] = useState<Baseline | null>(null);

  const [savingScenario, setSavingScenario] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scenarioSavePending, setScenarioSavePending] = useState(false);
  const [scenarioSaveSuccessFlash, setScenarioSaveSuccessFlash] = useState(false);

  const scenarioInlineRef = useRef<HTMLDivElement | null>(null);
  const successFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = useMemo(() => calculatePraxis(config), [config]);

  const cancelScenarioInline = useCallback(() => {
    setSavingScenario(false);
    setScenarioName("");
    setSaveError(null);
  }, []);

  const clearBaseline = () => {
    setBaseline(null);
    cancelScenarioInline();
    setScenarioSaveSuccessFlash(false);
    if (successFlashTimeoutRef.current) {
      clearTimeout(successFlashTimeoutRef.current);
      successFlashTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (successFlashTimeoutRef.current) {
        clearTimeout(successFlashTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!savingScenario) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelScenarioInline();
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-baseline-scenario-trigger]")) return;
      const el = scenarioInlineRef.current;
      if (el && !el.contains(event.target as Node)) {
        cancelScenarioInline();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [savingScenario, cancelScenarioInline]);

  const handleSaveBaselineScenario = async () => {
    if (!baseline) return;
    const trimmedName = scenarioName.trim();
    if (!trimmedName) {
      setSaveError("Bitte einen Namen eingeben.");
      return;
    }

    setSaveError(null);
    setScenarioSavePending(true);
    const cleanedConfig: PraxisConfig = {
      ...baseline.config,
      employees: baseline.config.employees.filter((e) => e.hours > 0),
    };

    try {
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          data: cleanedConfig,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { error?: string };
        setSaveError(error.error ?? "Szenario konnte nicht gespeichert werden.");
        return;
      }

      cancelScenarioInline();
      setScenarioSaveSuccessFlash(true);
      if (successFlashTimeoutRef.current) {
        clearTimeout(successFlashTimeoutRef.current);
      }
      successFlashTimeoutRef.current = setTimeout(() => {
        setScenarioSaveSuccessFlash(false);
        successFlashTimeoutRef.current = null;
      }, 2000);
    } catch {
      setSaveError("Netzwerkfehler.");
    } finally {
      setScenarioSavePending(false);
    }
  };

  const saveBaseline = () => {
    setBaseline({
      config,
      result,
      savedAt: new Date().toISOString(),
    });
  };

  const resetToBaseline = () => {
    if (!baseline) return;
    setConfig(baseline.config);
    setExpanded(baseline.config.employees.map(() => false));
  };

  const visibleIndices = useMemo(
    () =>
      config.employees
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => e.hours > 0)
        .map(({ i }) => i),
    [config.employees],
  );

  const anyExpanded = useMemo(
    () => visibleIndices.some((i) => expanded[i] ?? false),
    [visibleIndices, expanded],
  );

  const toggleAll = () => {
    setExpanded((prev) => {
      const next = [...prev];
      while (next.length < config.employees.length) {
        next.push(false);
      }
      visibleIndices.forEach((i) => {
        next[i] = !anyExpanded;
      });
      return next;
    });
  };

  const toggleExpanded = (index: number) => {
    setExpanded((prev) => {
      const next = [...prev];
      while (next.length <= index) {
        next.push(false);
      }
      next[index] = !next[index];
      return next;
    });
  };

  const sumWeeklyHours = useMemo(
    () => config.employees.reduce((s, e) => s + e.hours, 0),
    [config.employees],
  );

  const sumEffHours = useMemo(
    () => result.employeeDetails.reduce((s, e) => s + e.effHours, 0),
    [result.employeeDetails],
  );

  const updateEmployee = (index: number, updated: Employee) => {
    setConfig((prev) => {
      const employees = [...prev.employees];
      employees[index] = updated;
      return { ...prev, employees };
    });
  };

  const addEmployee = () => {
    let grew = false;
    setConfig((prev) => {
      if (prev.employees.length >= SOFT_LIMIT) return prev;
      grew = true;
      return {
        ...prev,
        employees: [...prev.employees, defaultEmployee(prev.employees.length)],
      };
    });
    if (grew) {
      setExpanded((prev) => [...prev, true]);
    }
  };

  const removeEmployee = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      employees: prev.employees.filter((_, i) => i !== index),
    }));
    setExpanded((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRevenue = useCallback((revenue: RevenueConfigDirect | RevenueConfigMix) => {
    setConfig((prev) => ({ ...prev, revenue }));
  }, []);

  const updateSachkosten = useCallback((sachkosten: SachkostenConfig) => {
    setConfig((prev) => ({ ...prev, sachkosten }));
  }, []);

  const loadScenario = (raw: unknown) => {
    const normalized = normalizePraxisConfig(raw);
    setConfig(normalized);
    setExpanded(normalized.employees.map(() => false));
  };

  const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <KpiBar result={result} baseline={baseline} />

      <main className="w-full space-y-6 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="mb-0 text-2xl font-bold text-brand-primary">
                Mitarbeiter
              </h2>
              {visibleIndices.length > 0 ? (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="rounded-md border border-brand-surface px-3 py-1.5 text-xs font-medium text-brand-primary"
                >
                  {anyExpanded ? "Alle einklappen" : "Alle aufklappen"}
                </button>
              ) : null}
            </div>
            {config.employees
              .map((employee, index) => ({ employee, index }))
              .filter(({ employee }) => employee.hours > 0)
              .map(({ employee, index }) => (
                <EmployeeCard
                  key={`emp-${index}`}
                  employee={employee}
                  index={index}
                  isExpanded={expanded[index] ?? false}
                  onToggleExpand={() => toggleExpanded(index)}
                  onChange={updateEmployee}
                  onRemove={removeEmployee}
                />
              ))}
            <button
              type="button"
              onClick={addEmployee}
              disabled={config.employees.length >= SOFT_LIMIT}
              className="w-full cursor-pointer rounded-2xl border border-dashed border-brand-primary/30 bg-brand-bg/30 p-6 text-center font-semibold text-brand-primary transition-colors hover:border-brand-primary/60 hover:bg-brand-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {config.employees.length >= SOFT_LIMIT
                ? `Maximum ${SOFT_LIMIT} Therapeut:innen erreicht`
                : "+ Mitarbeiter:in hinzufügen"}
            </button>
            <p className="rounded-lg border border-brand-surface bg-brand-bg px-3 py-2 text-sm font-medium text-brand-primary">
              Σ Wochenstunden: {euro0.format(sumWeeklyHours)} Std./Wo. | Σ Effektiv:{" "}
              {euro0.format(sumEffHours)} Std./Jahr | Σ Kosten:{" "}
              {euro0.format(result.personalCost)} €
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="mb-0 text-2xl font-bold text-brand-primary">Erlöse</h2>
            <RevenuePanel config={config.revenue} onChange={updateRevenue} />
            <Card variant="default" contentClassName="p-6">
              <Eyebrow>Weitere Einnahmen</Eyebrow>
              <h3 className="mb-4 mt-2 text-xl font-bold text-brand-ink">
                Sonstige Erträge
              </h3>
              <div className="space-y-3">
                <StepSlider
                  label="Untermiete pro Monat"
                  value={config.untermiete}
                  min={0}
                  max={2000}
                  step={50}
                  unit="€"
                  onChange={(untermiete) =>
                    setConfig((prev) => ({ ...prev, untermiete }))
                  }
                />
                <StepSlider
                  label="Rohertrag Handelsware / Jahr"
                  value={config.handelswareJahr}
                  min={0}
                  max={20000}
                  step={100}
                  unit="€"
                  hint="Verkaufserlöse minus Wareneinkauf. Typische Marge 30–50 %."
                  onChange={(handelswareJahr) =>
                    setConfig((prev) => ({ ...prev, handelswareJahr }))
                  }
                />
              </div>
            </Card>
            <h2 className="mb-0 text-2xl font-bold text-brand-primary">Kosten</h2>

            <Card variant="default" contentClassName="p-6">
              <Eyebrow>Kostenstruktur</Eyebrow>
              <h3 className="mb-4 mt-2 text-xl font-bold text-brand-ink">
                Räume &amp; Sachkosten
              </h3>

              <StepSlider
                label="Miete pro Monat"
                value={config.mieteMonat}
                min={0}
                max={5000}
                step={50}
                unit="€"
                onChange={(mieteMonat) =>
                  setConfig((prev) => ({ ...prev, mieteMonat }))
                }
              />

              <SachkostenInner
                config={config.sachkosten}
                onChange={updateSachkosten}
              />
            </Card>

            <Card variant="default" contentClassName="p-6" className="mt-6">
              <Eyebrow>Geschäftsführung</Eyebrow>
              <h3 className="mb-4 mt-2 text-xl font-bold text-brand-ink">
                Geschäftsführer-Gehalt
              </h3>

              <StepSlider
                label="GF-Gehalt pro Monat (nur GmbH)"
                value={config.gfGehaltMonat}
                min={0}
                max={10000}
                step={100}
                unit="€"
                onChange={(gfGehaltMonat) =>
                  setConfig((prev) => ({ ...prev, gfGehaltMonat }))
                }
              />
            </Card>
          </div>
        </div>

        <ProfitLoss
          result={result}
          employees={config.employees}
          sachkosten={config.sachkosten}
        />

        <MetricsCard
          result={result}
          sumWeeklyHours={sumWeeklyHours}
          revenueConfig={config.revenue}
        />

        <PraxisCharts result={result} />

        {config.refRevenue > 0 ? (
          <ComparisonTable
            result={result}
            refRevenue={config.refRevenue}
            refCosts={config.refCosts}
            refSurplus={config.refSurplus}
            refLabel={config.refLabel}
          />
        ) : null}

        <ScenarioPanel
          currentConfig={config}
          onLoad={loadScenario}
          baselineScenarioInlineRef={scenarioInlineRef}
          baseline={
            baseline
              ? {
                  state: "active",
                  savedLabel: formatBaselineLabel(baseline.savedAt),
                  onReset: resetToBaseline,
                  onUpdate: saveBaseline,
                  onClear: clearBaseline,
                  baselineScenario: {
                    inlineOpen: savingScenario,
                    scenarioName,
                    onScenarioNameChange: setScenarioName,
                    onToggleInline: () => {
                      setScenarioSaveSuccessFlash(false);
                      if (successFlashTimeoutRef.current) {
                        clearTimeout(successFlashTimeoutRef.current);
                        successFlashTimeoutRef.current = null;
                      }
                      setSavingScenario((open) => {
                        if (open) {
                          setScenarioName("");
                          setSaveError(null);
                          return false;
                        }
                        setSaveError(null);
                        return true;
                      });
                    },
                    onConfirmSave: handleSaveBaselineScenario,
                    pending: scenarioSavePending,
                    successFlash: scenarioSaveSuccessFlash,
                    error: saveError,
                  },
                }
              : { state: "empty", onRemember: saveBaseline }
          }
        />
      </main>
    </div>
  );
}
