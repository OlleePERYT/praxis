"use client";

import { useEffect, useState } from "react";
import { PraxisConfig } from "@/lib/engine";

type ScenarioDto = {
  id: number;
  name: string;
  data: string;
  created_at: string;
};

type ScenarioPanelProps = {
  currentConfig: PraxisConfig;
  onLoad: (config: PraxisConfig) => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("de-DE");
}

export function ScenarioPanel({ currentConfig, onLoad }: ScenarioPanelProps) {
  const [scenarios, setScenarios] = useState<ScenarioDto[]>([]);
  const [name, setName] = useState("");
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

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage("Bitte einen Namen eingeben.");
      return;
    }

    setMessage(null);
    const response = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        data: currentConfig,
      }),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as { error?: string };
      setMessage(error.error ?? "Szenario konnte nicht gespeichert werden.");
      return;
    }

    setName("");
    await loadScenarios();
  };

  const handleDelete = async (id: number) => {
    setMessage(null);
    const response = await fetch(`/api/scenarios/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as { error?: string };
      setMessage(error.error ?? "Szenario konnte nicht geloescht werden.");
      return;
    }

    await loadScenarios();
  };

  return (
    <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">Szenarien</h2>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Aktuellen Stand speichern als..."
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={maxReached}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          Speichern
        </button>
      </div>

      {maxReached ? <p className="text-sm text-amber-700">Max. 3 Szenarien erreicht</p> : null}
      {message ? <p className="text-sm text-rose-600">{message}</p> : null}
      {isLoading ? <p className="text-sm text-zinc-500">Lade Szenarien...</p> : null}

      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-zinc-900">{scenario.name}</p>
              <p className="text-sm text-zinc-500">{formatDate(scenario.created_at)}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onLoad(JSON.parse(scenario.data) as PraxisConfig)}
                className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Laden
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(scenario.id)}
                className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700 hover:bg-rose-50"
              >
                Loeschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
