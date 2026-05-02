"use client";

import { C } from "@/lib/colors";
import { getEmployeePersonnelCostYear, type Employee } from "@/lib/engine";
import { StepSlider } from "./StepSlider";

type EmployeeCardProps = {
  employee: Employee;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (index: number, updated: Employee) => void;
  onRemove: (index: number) => void;
};

export function EmployeeCard({
  employee,
  index,
  isExpanded,
  onToggleExpand,
  onChange,
  onRemove,
}: EmployeeCardProps) {
  const displayName = employee.name.trim().length > 0 ? employee.name : `Therapeut:in ${index + 1}`;
  const cost = getEmployeePersonnelCostYear(employee);

  const updateEmployee = (field: keyof Employee, value: string | number) => {
    onChange(index, {
      ...employee,
      [field]: value,
    });
  };

  return (
    <section
      className="rounded-xl border p-4 shadow-sm transition"
      style={{
        borderColor: C.lightBg2,
        backgroundColor: C.white,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
          onClick={onToggleExpand}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleExpand();
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`${displayName}: ${isExpanded ? "einklappen" : "aufklappen"}`}
        >
          <span className="text-xs shrink-0" style={{ color: C.lightGray }}>
            {isExpanded ? "▾" : "▸"}
          </span>
          <h3 className="truncate text-base font-semibold" style={{ color: C.primary }}>
            {displayName}
          </h3>
          {!isExpanded ? (
            <span className="ml-auto shrink-0 text-sm tabular-nums" style={{ color: C.gray }}>
              {Math.round(cost).toLocaleString("de-DE")} € / Jahr
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="shrink-0 rounded-md border px-2 py-1 text-xs font-medium"
          style={{ borderColor: C.lightBg2, color: C.lightGray }}
          aria-label={`${displayName} entfernen`}
        >
          Entfernen
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-sm" style={{ color: C.gray }} htmlFor={`employee-name-${index}`}>
              Name
            </label>
            <input
              id={`employee-name-${index}`}
              type="text"
              value={employee.name}
              onChange={(event) => updateEmployee("name", event.target.value)}
              className="w-full rounded-md border px-3 py-2"
              style={{ borderColor: C.lightBg2, color: C.primary }}
            />
          </div>

          <StepSlider
            label="Wochenstunden"
            value={employee.hours}
            min={0}
            max={40}
            step={1}
            unit="h/Woche"
            hint="0 (inaktiv) | 20 (Teilzeit) | 40 (Vollzeit)"
            onChange={(value) => updateEmployee("hours", value)}
          />
          <StepSlider
            label="Stundenlohn"
            value={employee.rate}
            min={12}
            max={60}
            step={1}
            unit="€/h"
            hint="16 € (Mindestlohn) | 25 € (Ø) | 38 € (Senior)"
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
            hint="0 € | 1.000 € (Standard) | 4.000 € (Spezialisierung)"
            onChange={(value) => updateEmployee("trainingCost", value)}
          />
        </div>
      ) : null}
    </section>
  );
}
