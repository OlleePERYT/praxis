"use client";

import { C } from "@/lib/colors";
import type { Employee } from "@/lib/engine";
import { StepSlider } from "./StepSlider";

type EmployeeCardProps = {
  employee: Employee;
  index: number;
  onChange: (index: number, updated: Employee) => void;
  onRemove: (index: number) => void;
};

export function EmployeeCard({
  employee,
  index,
  onChange,
  onRemove,
}: EmployeeCardProps) {
  const updateEmployee = (field: keyof Employee, value: string | number) => {
    onChange(index, {
      ...employee,
      [field]: value,
    });
  };

  return (
    <section
      className="rounded-xl border p-4 shadow-sm"
      style={{
        borderColor: C.lightBg2,
        backgroundColor: C.white,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-base font-semibold" style={{ color: C.primary }}>
          Therapeut:in {index + 1}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="shrink-0 rounded-md border px-2 py-1 text-xs font-medium"
          style={{ borderColor: C.lightBg2, color: C.lightGray }}
          aria-label={`Therapeut:in ${index + 1} entfernen`}
        >
          Entfernen
        </button>
      </div>

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
          label="Krankheitstage"
          value={employee.sick}
          min={0}
          max={30}
          step={1}
          onChange={(value) => updateEmployee("sick", value)}
        />
      </div>
    </section>
  );
}
