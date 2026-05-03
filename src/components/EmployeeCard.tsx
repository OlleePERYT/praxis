"use client";

import { getEmployeePersonnelCostYear, type Employee } from "@/lib/engine";
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

  const updateEmployee = (field: keyof Employee, value: string | number) => {
    onChange(index, {
      ...employee,
      [field]: value,
    });
  };

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

            <StepSlider
              label="Wochenstunden"
              value={employee.hours}
              min={0}
              max={40}
              step={1}
              unit="h/Woche"
              onChange={(value) => updateEmployee("hours", value)}
            />
            <StepSlider
              label="Stundenlohn"
              value={employee.rate}
              min={12}
              max={60}
              step={1}
              unit="€/h"
              onChange={(value) => updateEmployee("rate", value)}
            />
            <StepSlider
              label="Urlaubstage"
              value={employee.vacation}
              min={0}
              max={40}
              step={1}
              onChange={(value) => updateEmployee("vacation", value)}
            />
            <StepSlider
              label="Krankheitstage / Jahr"
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
              label="Weiterbildungskosten / Jahr"
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
