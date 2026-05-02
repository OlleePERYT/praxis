"use client";

import { useMemo, useState } from "react";
import { EmployeeCard } from "./EmployeeCard";
import { KpiBar } from "./KpiBar";
import { RevenuePanel } from "./RevenuePanel";
import { ScenarioPanel } from "./ScenarioPanel";
import { StepSlider } from "./StepSlider";
import {
  Employee,
  PraxisConfig,
  RevenueConfigDirect,
  RevenueConfigMix,
  calculatePraxis,
} from "@/lib/engine";

type SimulatorClientProps = {
  initialConfig: PraxisConfig;
};

const defaultEmployee: Employee = {
  name: "Therapeut:in",
  hours: 20,
  rate: 25,
  vacation: 30,
  sick: 5,
};

export function SimulatorClient({ initialConfig }: SimulatorClientProps) {
  const [config, setConfig] = useState<PraxisConfig>(initialConfig);

  const result = useMemo(() => calculatePraxis(config), [config]);

  const updateEmployee = (index: number, updated: Employee) => {
    setConfig((prev) => {
      const employees = [...prev.employees];
      employees[index] = updated;
      return { ...prev, employees };
    });
  };

  const removeEmployee = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      employees: prev.employees.filter((_, i) => i !== index),
    }));
  };

  const addEmployee = () => {
    setConfig((prev) => {
      if (prev.employees.length >= 5) return prev;
      return {
        ...prev,
        employees: [...prev.employees, { ...defaultEmployee, name: `Therapeut:in ${prev.employees.length + 1}` }],
      };
    });
  };

  const updateRevenue = (revenue: RevenueConfigDirect | RevenueConfigMix) => {
    setConfig((prev) => ({ ...prev, revenue }));
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <KpiBar result={result} />

      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900">Mitarbeiter</h2>
            <button
              type="button"
              onClick={addEmployee}
              disabled={config.employees.length >= 5}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              Therapeut:in hinzufügen
            </button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {config.employees.map((employee, index) => (
              <EmployeeCard
                key={`${employee.name}-${index}`}
                employee={employee}
                index={index}
                onChange={updateEmployee}
                onRemove={removeEmployee}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Erlöse</h2>
          <RevenuePanel config={config.revenue} onChange={updateRevenue} />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Kosten</h2>
          <div className="grid gap-3 lg:grid-cols-3">
            <StepSlider
              label="Miete pro Monat"
              value={config.mieteMonat}
              min={0}
              max={5000}
              step={50}
              unit="€"
              onChange={(mieteMonat) => setConfig((prev) => ({ ...prev, mieteMonat }))}
            />
            <StepSlider
              label="Sachkosten pro Jahr"
              value={config.sachkosten}
              min={0}
              max={80000}
              step={1000}
              unit="€"
              onChange={(sachkosten) => setConfig((prev) => ({ ...prev, sachkosten }))}
            />
            <StepSlider
              label="Untermiete pro Monat"
              value={config.untermiete}
              min={0}
              max={2000}
              step={50}
              unit="€"
              onChange={(untermiete) => setConfig((prev) => ({ ...prev, untermiete }))}
            />
          </div>
        </section>

        <ScenarioPanel
          currentConfig={config}
          onLoad={(loadedConfig) => {
            setConfig(loadedConfig);
          }}
        />
      </main>
    </div>
  );
}
