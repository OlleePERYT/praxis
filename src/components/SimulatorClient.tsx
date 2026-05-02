"use client";

import { useMemo, useState } from "react";
import { ComparisonTable } from "./ComparisonTable";
import { EmployeeCard } from "./EmployeeCard";
import { KpiBar } from "./KpiBar";
import { MetricsCard } from "./MetricsCard";
import { PraxisCharts } from "./PraxisCharts";
import { ProfitLoss } from "./ProfitLoss";
import { RevenuePanel } from "./RevenuePanel";
import { ScenarioPanel } from "./ScenarioPanel";
import { StepSlider } from "./StepSlider";
import { C } from "@/lib/colors";
import { defaultEmployee, normalizePraxisConfig } from "@/lib/praxis-config";
import type { Employee, PraxisConfig, RevenueConfigDirect, RevenueConfigMix } from "@/lib/engine";
import { calculatePraxis } from "@/lib/engine";

const SOFT_LIMIT = 25;

type SimulatorClientProps = {
  initialConfig: PraxisConfig;
};

export function SimulatorClient({ initialConfig }: SimulatorClientProps) {
  const [config, setConfig] = useState<PraxisConfig>(initialConfig);

  const result = useMemo(() => calculatePraxis(config), [config]);

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
    setConfig((prev) => {
      if (prev.employees.length >= SOFT_LIMIT) return prev;
      return {
        ...prev,
        employees: [...prev.employees, defaultEmployee(prev.employees.length)],
      };
    });
  };

  const removeEmployee = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      employees: prev.employees.filter((_, i) => i !== index),
    }));
  };

  const updateRevenue = (revenue: RevenueConfigDirect | RevenueConfigMix) => {
    setConfig((prev) => ({ ...prev, revenue }));
  };

  const loadScenario = (raw: unknown) => {
    setConfig(normalizePraxisConfig(raw));
  };

  const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.pageBg }}>
      <KpiBar result={result} />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: C.primary }}>
              Mitarbeiter
            </h2>
            {config.employees
              .map((employee, index) => ({ employee, index }))
              .filter(({ employee }) => employee.hours > 0)
              .map(({ employee, index }) => (
                <EmployeeCard
                  key={`emp-${index}`}
                  employee={employee}
                  index={index}
                  onChange={updateEmployee}
                  onRemove={removeEmployee}
                />
              ))}
            <button
              type="button"
              onClick={addEmployee}
              disabled={config.employees.length >= SOFT_LIMIT}
              className="w-full rounded-xl border-2 border-dashed py-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: C.lightBg2, color: C.primary }}
            >
              {config.employees.length >= SOFT_LIMIT
                ? `Maximum ${SOFT_LIMIT} Therapeut:innen erreicht`
                : "+ Therapeut:in hinzufügen"}
            </button>
            <p
              className="rounded-lg border px-3 py-2 text-sm font-medium"
              style={{
                borderColor: C.lightBg2,
                backgroundColor: C.lightBg,
                color: C.primary,
              }}
            >
              Σ Brutto: {euro0.format(sumWeeklyHours)} Std./Wo. | Σ Effektiv:{" "}
              {euro0.format(sumEffHours)} Std./Jahr | Σ Kosten: {euro0.format(result.personalCost)} €
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: C.primary }}>
              Erlöse
            </h2>
            <RevenuePanel config={config.revenue} onChange={updateRevenue} />
            <h2 className="text-xl font-semibold" style={{ color: C.primary }}>
              Kosten
            </h2>
            <div className="grid gap-3">
              <StepSlider
                label="Miete pro Monat"
                value={config.mieteMonat}
                min={0}
                max={5000}
                step={50}
                unit="€"
                hint="500 € | 1.500 € | 3.000 €"
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
              <StepSlider
                label="GF-Gehalt pro Monat (nur GmbH)"
                value={config.gfGehaltMonat}
                min={0}
                max={15000}
                step={250}
                unit="€"
                hint="0 € (kein GF-Gehalt) | 4.500 € | 8.000 €"
                onChange={(gfGehaltMonat) =>
                  setConfig((prev) => ({ ...prev, gfGehaltMonat }))
                }
              />
              <StepSlider
                label="Inhaberentnahme pro Monat (Einzelunt./GbR)"
                value={config.inhaberEntnahmeMonat}
                min={0}
                max={15000}
                step={250}
                unit="€"
                hint="0 € (keine Entnahme) | 3.000 € | 6.000 €"
                onChange={(inhaberEntnahmeMonat) =>
                  setConfig((prev) => ({ ...prev, inhaberEntnahmeMonat }))
                }
              />
            </div>
          </div>
        </div>

        <ProfitLoss result={result} employees={config.employees} />

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

        <ScenarioPanel currentConfig={config} onLoad={loadScenario} />
      </main>
    </div>
  );
}
