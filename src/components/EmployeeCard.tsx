"use client";

import { Employee } from "@/lib/engine";
import { StepSlider } from "./StepSlider";

type EmployeeCardProps = {
  employee: Employee;
  index: number;
  onChange: (index: number, updated: Employee) => void;
  onRemove: (index: number) => void;
};

export function EmployeeCard({ employee, index, onChange, onRemove }: EmployeeCardProps) {
  const updateEmployee = (field: keyof Employee, value: string | number) => {
    onChange(index, {
      ...employee,
      [field]: value,
    });
  };

  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-zinc-900">Therapeutin {index + 1}</h3>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Entfernen
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-700" htmlFor={`employee-name-${index}`}>
          Name
        </label>
        <input
          id={`employee-name-${index}`}
          type="text"
          value={employee.name}
          onChange={(event) => updateEmployee("name", event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>

      <StepSlider
        label="Wochenstunden"
        value={employee.hours}
        min={0}
        max={40}
        step={5}
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
        label="Krankheitstage"
        value={employee.sick}
        min={0}
        max={30}
        step={1}
        onChange={(value) => updateEmployee("sick", value)}
      />
    </section>
  );
}
