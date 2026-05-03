"use client";

import type {
  Employee,
  PraxisConfig,
  PraxisResult,
  RevenueConfigDirect,
  RevenueConfigMix,
  SachkostenConfig,
} from "@/lib/engine";
import { EmployeeCard } from "@/components/EmployeeCard";
import { MetricsCard } from "@/components/MetricsCard";
import { ProfitLoss } from "@/components/ProfitLoss";
import { RevenuePanel } from "@/components/RevenuePanel";
import { SachkostenInner } from "@/components/SachkostenInner";
import { StepSlider } from "@/components/StepSlider";
import Card from "@/components/ui/Card";

export type CockpitTabProps = {
  softLimit: number;
  config: PraxisConfig;
  result: PraxisResult;
  expanded: boolean[];
  visibleIndices: number[];
  anyExpanded: boolean;
  toggleAll: () => void;
  toggleExpanded: (index: number) => void;
  updateEmployee: (index: number, updated: Employee) => void;
  removeEmployee: (index: number) => void;
  addEmployee: () => void;
  sumWeeklyHours: number;
  sumEffHours: number;
  updateRevenue: (revenue: RevenueConfigDirect | RevenueConfigMix) => void;
  updateSachkosten: (sachkosten: SachkostenConfig) => void;
  setUntermiete: (value: number) => void;
  setHandelswareJahr: (value: number) => void;
  setMieteMonat: (value: number) => void;
  setGfGehaltMonat: (value: number) => void;
};

const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export function CockpitTab({
  softLimit,
  config,
  result,
  expanded,
  visibleIndices,
  anyExpanded,
  toggleAll,
  toggleExpanded,
  updateEmployee,
  removeEmployee,
  addEmployee,
  sumWeeklyHours,
  sumEffHours,
  updateRevenue,
  updateSachkosten,
  setUntermiete,
  setHandelswareJahr,
  setMieteMonat,
  setGfGehaltMonat,
}: CockpitTabProps) {
  return (
    <div className="space-y-6">
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
            disabled={config.employees.length >= softLimit}
            className="w-full cursor-pointer rounded-2xl border border-dashed border-brand-primary/30 bg-brand-bg/30 p-6 text-center font-semibold text-brand-primary transition-colors hover:border-brand-primary/60 hover:bg-brand-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {config.employees.length >= softLimit
              ? `Maximum ${softLimit} Therapeut:innen erreicht`
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
            <h3 className="mb-4 text-xl font-bold text-brand-ink">
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
                onChange={setUntermiete}
              />
              <StepSlider
                label="Rohertrag Handelsware / Jahr"
                value={config.handelswareJahr}
                min={0}
                max={20000}
                step={100}
                unit="€"
                onChange={setHandelswareJahr}
              />
            </div>
          </Card>
          <h2 className="mb-0 text-2xl font-bold text-brand-primary">Kosten</h2>

          <Card variant="default" contentClassName="p-6">
            <h3 className="mb-4 text-xl font-bold text-brand-ink">
              Räume &amp; Sachkosten
            </h3>

            <StepSlider
              label="Miete pro Monat"
              value={config.mieteMonat}
              min={0}
              max={5000}
              step={50}
              unit="€"
              onChange={setMieteMonat}
            />

            <SachkostenInner
              config={config.sachkosten}
              onChange={updateSachkosten}
            />
          </Card>

          <Card variant="default" contentClassName="p-6" className="mt-6">
            <h3 className="mb-4 text-xl font-bold text-brand-ink">
              Geschäftsführer-Gehalt
            </h3>

            <StepSlider
              label="GF-Gehalt pro Monat (nur GmbH)"
              value={config.gfGehaltMonat}
              min={0}
              max={10000}
              step={100}
              unit="€"
              onChange={setGfGehaltMonat}
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
    </div>
  );
}
