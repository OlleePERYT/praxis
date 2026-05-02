"use client";

import type { RefObject } from "react";
import { useEffect, useState } from "react";
import Card from "./ui/Card";
import Eyebrow from "./ui/Eyebrow";
import type { PraxisConfig } from "@/lib/engine";

type ScenarioDto = {
  id: number;
  name: string;
  data: string;
  created_at: string;
};

export type ScenarioBaselineScenarioInline = {
  inlineOpen: boolean;
  scenarioName: string;
  onScenarioNameChange: (value: string) => void;
  onToggleInline: () => void;
  onConfirmSave: () => void | Promise<void>;
  pending: boolean;
  successFlash: boolean;
  error: string | null;
};

export type ScenarioPanelBaselineProps =
  | {
      state: "empty";
      onRemember: () => void;
    }
  | {
      state: "active";
      savedLabel: string;
      onReset: () => void;
      onUpdate: () => void;
      onClear: () => void;
      baselineScenario: ScenarioBaselineScenarioInline;
    };

type ScenarioPanelProps = {
  currentConfig: PraxisConfig;
  onLoad: (config: unknown) => void;
  baseline: ScenarioPanelBaselineProps;
  baselineScenarioInlineRef: RefObject<HTMLDivElement | null>;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("de-DE");
}

export function ScenarioPanel({
  currentConfig,
  onLoad,
  baseline,
  baselineScenarioInlineRef,
}: ScenarioPanelProps) {
  const [scenarios, setScenarios] = useState<ScenarioDto[]>([]);
  const [saveExpanded, setSaveExpanded] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const maxReached = scenarios.length >= 3;

  const loadScenarios = async () => {
    try {
      const response = await fetch("/api/scenarios", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Szenarien konnten nicht geladen werden.");
      }

      const data = (await response.json()) as ScenarioDto[];
      setScenarios(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unbekannter Fehler.");
    }
  };

  useEffect(() => {
    let active = true;

    fetch("/api/scenarios", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Szenarien konnten nicht geladen werden.");
        }
        const data = (await response.json()) as ScenarioDto[];
        if (active) {
          setScenarios(data);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Unbekannter Fehler.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSaveCurrent = async () => {
    const trimmedName = saveName.trim();
    if (!trimmedName) {
      setMessage("Bitte einen Namen eingeben.");
      return;
    }

    setMessage(null);
    const cleanedConfig: PraxisConfig = {
      ...currentConfig,
      employees: currentConfig.employees.filter((e) => e.hours > 0),
    };
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
      setMessage(error.error ?? "Szenario konnte nicht gespeichert werden.");
      return;
    }

    setSaveName("");
    setSaveExpanded(false);
    await loadScenarios();
  };

  const handleDelete = async (id: number) => {
    setMessage(null);
    const response = await fetch(`/api/scenarios/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as { error?: string };
      setMessage(error.error ?? "Szenario konnte nicht gelöscht werden.");
      return;
    }

    await loadScenarios();
  };

  const baselineScenarioControls =
    baseline.state === "active" ? baseline.baselineScenario : null;

  return (
    <Card variant="default">
      <Eyebrow>Szenarien</Eyebrow>
      <h3 className="mb-4 mt-4 text-xl font-bold text-brand-ink">
        Was-wäre-wenn
      </h3>

      <div className="rounded-xl bg-[var(--color-brand-surface-cool)] p-4">
        {baseline.state === "empty" ? (
          <button
            type="button"
            onClick={baseline.onRemember}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Aktuellen Stand merken
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-brand-muted">
              Baseline:{" "}
              <span className="font-medium text-brand-text">
                {baseline.savedLabel}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={baseline.onReset}
                className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-bg/40"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={baseline.onUpdate}
                className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-bg/40"
              >
                Aktualisieren
              </button>
              <button
                type="button"
                onClick={baseline.onClear}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                Löschen
              </button>
            </div>

            {baselineScenarioControls ? (
              <div className="border-t border-[var(--color-brand-border-soft)] pt-3">
                <button
                  type="button"
                  data-baseline-scenario-trigger
                  onClick={baselineScenarioControls.onToggleInline}
                  disabled={
                    baselineScenarioControls.pending ||
                    baselineScenarioControls.successFlash ||
                    maxReached
                  }
                  className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-bg/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {baselineScenarioControls.successFlash
                    ? "Gespeichert ✓"
                    : "Baseline als Szenario speichern"}
                </button>
                {baselineScenarioControls.inlineOpen ? (
                  <div
                    ref={baselineScenarioInlineRef}
                    className="mt-3 flex flex-wrap items-center gap-2"
                  >
                    <input
                      type="text"
                      value={baselineScenarioControls.scenarioName}
                      onChange={(event) =>
                        baselineScenarioControls.onScenarioNameChange(
                          event.target.value,
                        )
                      }
                      placeholder="Name des Szenarios"
                      autoFocus
                      className="min-w-[12rem] flex-1 rounded-lg border border-[var(--color-brand-border-soft)] px-3 py-2 text-sm text-brand-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => void baselineScenarioControls.onConfirmSave()}
                      disabled={baselineScenarioControls.pending}
                      className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {baselineScenarioControls.pending ? "…" : "Speichern"}
                    </button>
                    {baselineScenarioControls.error ? (
                      <span className="text-xs text-red-600">
                        {baselineScenarioControls.error}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {!maxReached && !saveExpanded ? (
          <button
            type="button"
            onClick={() => {
              setSaveExpanded(true);
              setMessage(null);
            }}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Aktuellen Stand als Szenario speichern
          </button>
        ) : null}

        {saveExpanded && !maxReached ? (
          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-[var(--color-brand-border-soft)] bg-brand-bg/30 p-4">
            <div className="min-w-[12rem] flex-1">
              <label className="mb-1 block text-xs font-medium text-brand-muted">
                Szenario-Name
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(event) => setSaveName(event.target.value)}
                placeholder="z. B. Optimierte Auslastung"
                className="w-full rounded-lg border border-[var(--color-brand-border-soft)] px-3 py-2 text-sm text-brand-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleSaveCurrent()}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={() => {
                setSaveExpanded(false);
                setSaveName("");
                setMessage(null);
              }}
              className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-4 py-2 text-sm font-semibold text-brand-text"
            >
              Abbrechen
            </button>
          </div>
        ) : null}

        {maxReached ? (
          <p className="text-sm text-orange-600">
            Max. 3 Szenarien erreicht
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-red-600">{message}</p>
        ) : null}
        {isLoading ? (
          <p className="text-sm text-brand-muted">Lade Szenarien…</p>
        ) : null}

        <div className="space-y-2">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--color-brand-border-soft)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-brand-ink">
                  {scenario.name}
                </p>
                <p className="text-xs text-brand-muted">
                  {formatDate(scenario.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      onLoad(JSON.parse(scenario.data));
                    } catch {
                      setMessage("Szenario-Daten sind ungültig.");
                    }
                  }}
                  className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-bg/40"
                >
                  Laden
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(scenario.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
