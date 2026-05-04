"use client";

import {
  getEmployeePersonnelCostYear,
  type Employee,
  type EmploymentType,
  type EmployerCostMode,
  type WageMode,
} from "@/lib/engine";
import Card from "./ui/Card";
import { StepSlider } from "./StepSlider";

type EmployeeCardProps = {
  employee: Employee;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (index: number, updated: Employee) => void;
  onRemove: (index: number) => void;
};

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`transition-transform ${expanded ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

/** Gleiches Markup wie RevenuePanel / SachkostenInner (Mode-Umschalter). */
function ModePill({
  active,
  children,
  onClick,
  className,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all sm:flex-none ${active ? "bg-white text-brand-primary shadow-sm" : "text-brand-muted hover:text-brand-ink"} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function FieldHint({ text }: { text: string }) {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full border border-[var(--color-brand-border-soft)] text-[10px] font-bold leading-none text-brand-muted"
      title={text}
      aria-label={text}
      role="img"
    >
      ?
    </span>
  );
}

function MetaBadge({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-brand-primary/15 bg-brand-primary/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-brand-primary">
      {children}
    </span>
  );
}

export function EmployeeCard({
  employee,
  index,
  isExpanded,
  onToggleExpand,
  onChange,
  onRemove,
}: EmployeeCardProps) {
  const displayName =
    employee.name.trim().length > 0 ? employee.name : `Therapeut:in ${index + 1}`;
  const cost = getEmployeePersonnelCostYear(employee);

  const employmentType: EmploymentType = employee.employmentType ?? "festangestellt";
  const wageMode: WageMode = employee.wageMode ?? "hourly";
  const employerCostMode: EmployerCostMode = employee.employerCostMode ?? "factor";

  const hasMetaBadges =
    employmentType === "minijob" ||
    wageMode === "monthly" ||
    employerCostMode === "manual";

  const updateEmployee = (field: keyof Employee, value: string | number) => {
    onChange(index, {
      ...employee,
      [field]: value,
    });
  };

  const patchEmployee = (patch: Partial<Employee>) => {
    onChange(index, { ...employee, ...patch });
  };

  const monthlyGross = employee.monthlyGross ?? 0;
  const employerCostManualMonat = employee.employerCostManualMonat ?? 0;

  return (
    <Card variant="default" contentClassName="p-4">
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1 truncate font-semibold text-brand-ink">
          {displayName}
        </span>
        <span className="shrink-0 rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-semibold text-brand-primary">
          {Math.round(cost).toLocaleString("de-DE")} €/Jahr
        </span>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-label={`${displayName}: ${isExpanded ? "einklappen" : "aufklappen"}`}
          className="shrink-0 rounded-lg bg-brand-bg/50 p-2 text-brand-muted transition-colors hover:bg-brand-primary/5 hover:text-brand-primary"
        >
          <ChevronIcon expanded={isExpanded} />
        </button>
      </div>

      {!isExpanded && hasMetaBadges ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {employmentType === "minijob" ? <MetaBadge>Minijob</MetaBadge> : null}
          {wageMode === "monthly" ? <MetaBadge>Monatsbrutto</MetaBadge> : null}
          {employerCostMode === "manual" ? (
            <MetaBadge>AG-Kosten manuell</MetaBadge>
          ) : null}
        </div>
      ) : null}

      {isExpanded ? (
        <div className="relative mt-4 border-t border-[var(--color-brand-border-soft)] pt-4 pb-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                className="mb-1 block text-sm text-brand-muted"
                htmlFor={`employee-name-${index}`}
              >
                Name
              </label>
              <input
                id={`employee-name-${index}`}
                type="text"
                value={employee.name}
                onChange={(event) => updateEmployee("name", event.target.value)}
                className="w-full rounded-md border border-brand-surface px-3 py-2 text-brand-ink"
              />
            </div>

            <div className="md:col-span-2">
              <div className="mb-1 flex items-center gap-1.5">
                <label
                  className="text-sm text-brand-muted"
                  htmlFor={`employee-employment-${index}`}
                >
                  Beschäftigungsart
                </label>
                <FieldHint text="Festangestellt: AG-Faktor 1,21 (regulärer SV-Aufschlag). Minijob: AG-Faktor 1,32 (gewerbliche Pauschalabgaben 2026 inkl. BG)." />
              </div>
              <select
                id={`employee-employment-${index}`}
                value={employmentType}
                onChange={(event) =>
                  patchEmployee({
                    employmentType: event.target.value as EmploymentType,
                  })
                }
                className="w-full rounded-md border border-brand-surface bg-white px-3 py-2 text-sm text-brand-ink"
              >
                <option value="festangestellt">Festangestellt</option>
                <option value="minijob">Minijob</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-sm text-brand-muted">Lohnform</span>
                <FieldHint text="Stundenlohn: Stundensatz × Wochenstunden × 52. Monatslohn: monatliches Bruttogehalt × 12." />
              </div>
              <div className="flex w-full rounded-full bg-brand-bg p-1 sm:inline-flex sm:w-auto">
                <ModePill
                  active={wageMode === "hourly"}
                  onClick={() => patchEmployee({ wageMode: "hourly" })}
                >
                  Stundenlohn
                </ModePill>
                <ModePill
                  active={wageMode === "monthly"}
                  onClick={() => patchEmployee({ wageMode: "monthly" })}
                >
                  Monatslohn
                </ModePill>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-sm text-brand-muted">AG-Nebenkosten</span>
                <FieldHint text="Pauschal: AG-Faktor je nach Beschäftigungsart. Manuell: AG-Nebenkosten in €/Monat selbst eintragen (z. B. aus der Lohnabrechnung)." />
              </div>
              <div className="flex w-full rounded-full bg-brand-bg p-1 sm:inline-flex sm:w-auto">
                <ModePill
                  active={employerCostMode === "factor"}
                  onClick={() => patchEmployee({ employerCostMode: "factor" })}
                >
                  Pauschal
                </ModePill>
                <ModePill
                  active={employerCostMode === "manual"}
                  onClick={() => patchEmployee({ employerCostMode: "manual" })}
                >
                  Manuell
                </ModePill>
              </div>
            </div>

            <StepSlider
              label="Wochenstunden"
              value={employee.hours}
              min={0}
              max={40}
              step={1}
              unit="h/Woche"
              onChange={(value) => updateEmployee("hours", value)}
            />

            {wageMode === "hourly" ? (
              <StepSlider
                label="Stundenlohn"
                value={employee.rate}
                min={12}
                max={60}
                step={1}
                unit="€/h"
                onChange={(value) => updateEmployee("rate", value)}
              />
            ) : (
              <StepSlider
                label="Monatsbruttogehalt"
                value={monthlyGross}
                min={0}
                max={6000}
                step={50}
                unit="€/Monat"
                onChange={(value) => updateEmployee("monthlyGross", value)}
              />
            )}

            {employerCostMode === "manual" ? (
              <div className="md:col-span-2">
                <StepSlider
                  label="AG-Nebenkosten"
                  value={employerCostManualMonat}
                  min={0}
                  max={3000}
                  step={100}
                  unit="€/Monat"
                  onChange={(value) =>
                    updateEmployee("employerCostManualMonat", value)
                  }
                />
              </div>
            ) : null}

            <StepSlider
              label="Urlaubstage"
              value={employee.vacation}
              min={0}
              max={40}
              step={1}
              onChange={(value) => updateEmployee("vacation", value)}
            />
            <StepSlider
              label={"Krankheitstage /\u00A0Jahr"}
              value={employee.sick}
              min={0}
              max={30}
              step={1}
              onChange={(value) => updateEmployee("sick", value)}
            />
            <StepSlider
              label="Weiterbildungstage / Jahr"
              value={employee.training}
              min={0}
              max={30}
              step={1}
              onChange={(value) => updateEmployee("training", value)}
            />
            <StepSlider
              label={"Weiterbildungskosten /\u00A0Jahr"}
              value={employee.trainingCost}
              min={0}
              max={10000}
              step={100}
              unit="€"
              onChange={(value) => updateEmployee("trainingCost", value)}
            />
          </div>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute bottom-0 right-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
            aria-label={`${displayName} entfernen`}
          >
            <TrashIcon />
          </button>
        </div>
      ) : null}
    </Card>
  );
}
