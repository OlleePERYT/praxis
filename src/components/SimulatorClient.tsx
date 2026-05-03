"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComparisonTable } from "./ComparisonTable";
import { hashToTab, type DashboardTabId } from "./DashboardTabs";
import { KpiBar } from "./KpiBar";
import { PracticeHeader } from "./PracticeHeader";
import { ScenarioPanel } from "./ScenarioPanel";
import { AuswertungTab } from "./tabs/AuswertungTab";
import { CockpitTab } from "./tabs/CockpitTab";
import { VergleichTab } from "./tabs/VergleichTab";
import {
  buildPracticeConfigDocument,
  defaultEmployee,
  normalizePraxisConfig,
} from "@/lib/praxis-config";
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
  practiceName: string;
  initialConfig: PraxisConfig;
  initialBaseline?: Baseline | null;
};

function sealPersistedPayload(cfg: PraxisConfig, b: Baseline | null): string {
  const norm = normalizePraxisConfig(JSON.parse(JSON.stringify(cfg)));
  const doc = buildPracticeConfigDocument(
    norm,
    b ? { savedAt: b.savedAt, snapshot: b.config } : null,
  );
  return JSON.stringify(doc);
}

export function SimulatorClient({
  practiceName,
  initialConfig,
  initialBaseline = null,
}: SimulatorClientProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>(() =>
    typeof window !== "undefined" ? hashToTab(window.location.hash) : "cockpit",
  );

  const syncTabFromHash = useCallback(() => {
    setActiveTab(hashToTab(typeof window !== "undefined" ? window.location.hash : ""));
  }, []);

  useEffect(() => {
    syncTabFromHash();
    window.addEventListener("popstate", syncTabFromHash);
    return () => window.removeEventListener("popstate", syncTabFromHash);
  }, [syncTabFromHash]);

  const selectTab = useCallback((tab: DashboardTabId) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  }, []);

  const [config, setConfig] = useState<PraxisConfig>(initialConfig);
  const [expanded, setExpanded] = useState<boolean[]>(() =>
    initialConfig.employees.map(() => false),
  );
  const [baseline, setBaseline] = useState<Baseline | null>(() =>
    initialBaseline ?? null,
  );

  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [rememberBusy, setRememberBusy] = useState(false);

  const lastPersistedRef = useRef(sealPersistedPayload(initialConfig, initialBaseline ?? null));
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [savingScenario, setSavingScenario] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scenarioSavePending, setScenarioSavePending] = useState(false);
  const [scenarioSaveSuccessFlash, setScenarioSaveSuccessFlash] = useState(false);

  const scenarioInlineRef = useRef<HTMLDivElement | null>(null);
  const successFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = useMemo(() => calculatePraxis(config), [config]);

  const persistWorkspace = useCallback(
    async (cfg: PraxisConfig, anchor: { savedAt: string; snapshot: PraxisConfig } | null) => {
      const res = await fetch("/api/practice/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: cfg,
          comparisonAnchor: anchor,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Speichern fehlgeschlagen.");
      }
    },
    [],
  );

  useEffect(() => {
    const nextSeal = sealPersistedPayload(config, baseline);
    if (nextSeal === lastPersistedRef.current) return;

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          setWorkspaceError(null);
          const norm = normalizePraxisConfig(JSON.parse(JSON.stringify(config)));
          await persistWorkspace(
            norm,
            baseline
              ? { savedAt: baseline.savedAt, snapshot: baseline.config }
              : null,
          );
          lastPersistedRef.current = sealPersistedPayload(config, baseline);
        } catch (err) {
          setWorkspaceError(
            err instanceof Error ? err.message : "Speichern fehlgeschlagen.",
          );
        }
      })();
    }, 1200);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [config, baseline, persistWorkspace]);

  const cancelScenarioInline = useCallback(() => {
    setSavingScenario(false);
    setScenarioName("");
    setSaveError(null);
  }, []);

  const clearBaseline = async () => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }
    setBaseline(null);
    cancelScenarioInline();
    setScenarioSaveSuccessFlash(false);
    if (successFlashTimeoutRef.current) {
      clearTimeout(successFlashTimeoutRef.current);
      successFlashTimeoutRef.current = null;
    }
    try {
      setWorkspaceError(null);
      const norm = normalizePraxisConfig(JSON.parse(JSON.stringify(config)));
      await persistWorkspace(norm, null);
      lastPersistedRef.current = sealPersistedPayload(norm, null);
    } catch (err) {
      setWorkspaceError(
        err instanceof Error ? err.message : "Speichern fehlgeschlagen.",
      );
    }
  };

  /** Vergleichspunkt setzen oder überschreiben — wird serverseitig gespeichert. */
  const rememberComparisonPoint = async () => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }
    setRememberBusy(true);
    setWorkspaceError(null);
    try {
      const normCfg = normalizePraxisConfig(JSON.parse(JSON.stringify(config)));
      const savedAt = new Date().toISOString();
      const newBaseline: Baseline = {
        config: normCfg,
        result: calculatePraxis(normCfg),
        savedAt,
      };
      setConfig(normCfg);
      setBaseline(newBaseline);
      await persistWorkspace(normCfg, { savedAt, snapshot: normCfg });
      lastPersistedRef.current = sealPersistedPayload(normCfg, newBaseline);
    } catch (err) {
      setWorkspaceError(
        err instanceof Error ? err.message : "Speichern fehlgeschlagen.",
      );
    } finally {
      setRememberBusy(false);
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PracticeHeader
        practiceName={practiceName}
        dashboardTabs={{
          activeTab,
          onSelectTab: selectTab,
        }}
      />
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-6 pb-6">
        <KpiBar result={result} baseline={baseline} />

        <div className="w-full space-y-6 pt-6">
          {activeTab === "cockpit" ? (
            <CockpitTab
              softLimit={SOFT_LIMIT}
              config={config}
              result={result}
              expanded={expanded}
              visibleIndices={visibleIndices}
              anyExpanded={anyExpanded}
              toggleAll={toggleAll}
              toggleExpanded={toggleExpanded}
              updateEmployee={updateEmployee}
              removeEmployee={removeEmployee}
              addEmployee={addEmployee}
              sumWeeklyHours={sumWeeklyHours}
              sumEffHours={sumEffHours}
              updateRevenue={updateRevenue}
              updateSachkosten={updateSachkosten}
              setUntermiete={(untermiete) =>
                setConfig((prev) => ({ ...prev, untermiete }))
              }
              setHandelswareJahr={(handelswareJahr) =>
                setConfig((prev) => ({ ...prev, handelswareJahr }))
              }
              setMieteMonat={(mieteMonat) =>
                setConfig((prev) => ({ ...prev, mieteMonat }))
              }
              setGfGehaltMonat={(gfGehaltMonat) =>
                setConfig((prev) => ({ ...prev, gfGehaltMonat }))
              }
            />
          ) : null}
          {activeTab === "auswertung" ? (
            <AuswertungTab config={config} result={result} />
          ) : null}
          {activeTab === "vergleich" ? (
            <VergleichTab
              showEmptyHint={baseline === null && config.refRevenue <= 0}
              rememberBusy={rememberBusy}
              onRememberComparisonPoint={rememberComparisonPoint}
              comparisonTable={
                config.refRevenue > 0 ? (
                  <ComparisonTable
                    result={result}
                    refRevenue={config.refRevenue}
                    refCosts={config.refCosts}
                    refSurplus={config.refSurplus}
                    refLabel={config.refLabel}
                  />
                ) : null
              }
            >
              <ScenarioPanel
                currentConfig={config}
                onLoad={loadScenario}
                baselineScenarioInlineRef={scenarioInlineRef}
                workspaceError={workspaceError}
                rememberBusy={rememberBusy}
                baseline={
                  baseline
                    ? {
                        state: "active",
                        savedLabel: formatBaselineLabel(baseline.savedAt),
                        onReset: resetToBaseline,
                        onUpdate: rememberComparisonPoint,
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
                    : { state: "empty", onRemember: rememberComparisonPoint }
                }
              />
            </VergleichTab>
          ) : null}
        </div>
      </div>
    </div>
  );
}
