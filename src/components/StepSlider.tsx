"use client";

import type { ReactNode } from "react";
import { C } from "@/lib/colors";

type StepSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: ReactNode;
  onChange: (value: number) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value: number, min: number, step: number): number {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

export function StepSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: StepSliderProps) {
  const updateValue = (nextValue: number) => {
    const rounded = roundToStep(nextValue, min, step);
    onChange(clamp(rounded, min, max));
  };

  return (
    <fieldset
      className="rounded-lg border p-3"
      style={{ borderColor: C.lightBg2, backgroundColor: C.white }}
    >
      <legend className="px-1 text-sm font-medium" style={{ color: C.gray }}>
        {label}
      </legend>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateValue(value - step)}
          className="h-10 w-10 rounded-md border text-lg font-semibold"
          style={{ borderColor: C.lightBg2, color: C.primary }}
          aria-label={`${label} verringern`}
        >
          -
        </button>

        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => updateValue(Number(event.target.value))}
          className="h-10 w-full rounded-md border px-3"
          style={{ borderColor: C.lightBg2, color: C.primary }}
          aria-label={label}
        />

        <button
          type="button"
          onClick={() => updateValue(value + step)}
          className="h-10 w-10 rounded-md border text-lg font-semibold"
          style={{ borderColor: C.lightBg2, color: C.primary }}
          aria-label={`${label} erhöhen`}
        >
          +
        </button>
      </div>

      <p className="mt-2 text-xs" style={{ color: C.lightGray }}>
        Bereich: {min} bis {max}
        {unit ? ` ${unit}` : ""}, Schritt: {step}
      </p>
      {hint ? (
        <p className="mt-1 text-xs" style={{ color: C.accent }}>
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}
