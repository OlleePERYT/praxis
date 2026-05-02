"use client";

import { useEffect, useState } from "react";
import { C } from "@/lib/colors";
import type { PraxisConfig } from "@/lib/engine";

type ScenarioDto = {
  id: number;
  name: string;
  data: string;
  created_at: string;
};

type ScenarioPanelProps = {
  currentConfig: PraxisConfig;
  onLoad: (config: unknown) => void;
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
      setMessage(error.error ?? "Szenario konnte nicht gelöscht werden.");
      return;
    }

    await loadScenarios();
  };

  return (
    <section
      className="space-y-4 rounded-xl border p-4 shadow-sm"
      style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
    >
      <h2 className="text-xl font-semibold" style={{ color: C.primary }}>
        Szenarien
      </h2>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Aktuellen Stand speichern als..."
          className="w-full rounded-md border px-3 py-2"
          style={{ borderColor: C.lightBg2, color: C.primary }}
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={maxReached}
          className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: C.primary }}
        >
          Speichern
        </button>
      </div>

      {maxReached ? (
        <p className="text-sm" style={{ color: C.orange }}>
          Max. 3 Szenarien erreicht
        </p>
      ) : null}
      {message ? (
        <p className="text-sm" style={{ color: C.red }}>
          {message}
        </p>
      ) : null}
      {isLoading ? (
        <p className="text-sm" style={{ color: C.lightGray }}>
          Lade Szenarien...
        </p>
      ) : null}

      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: C.lightBg2 }}
          >
            <div>
              <p className="font-medium" style={{ color: C.primary }}>
                {scenario.name}
              </p>
              <p className="text-sm" style={{ color: C.lightGray }}>
                {formatDate(scenario.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    onLoad(JSON.parse(scenario.data));
                  } catch {
                    setMessage("Szenario-Daten sind ungültig.");
                  }
                }}
                className="rounded-md border px-3 py-1 text-sm"
                style={{ borderColor: C.lightBg2, color: C.primary }}
              >
                Laden
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(scenario.id)}
                className="rounded-md border px-3 py-1 text-sm"
                style={{ borderColor: C.red, color: C.red }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
