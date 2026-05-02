"use client";

type StepSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
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
  onChange,
}: StepSliderProps) {
  const updateValue = (nextValue: number) => {
    const rounded = roundToStep(nextValue, min, step);
    onChange(clamp(rounded, min, max));
  };

  return (
    <fieldset className="rounded-lg border border-zinc-200 p-3">
      <legend className="px-1 text-sm font-medium text-zinc-700">{label}</legend>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateValue(value - step)}
          className="h-10 w-10 rounded-md border border-zinc-300 text-lg font-semibold hover:bg-zinc-100"
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
          className="h-10 w-full rounded-md border border-zinc-300 px-3 text-zinc-900"
          aria-label={label}
        />

        <button
          type="button"
          onClick={() => updateValue(value + step)}
          className="h-10 w-10 rounded-md border border-zinc-300 text-lg font-semibold hover:bg-zinc-100"
          aria-label={`${label} erhöhen`}
        >
          +
        </button>
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        Bereich: {min} bis {max}
        {unit ? ` ${unit}` : ""}, Schritt: {step}
      </p>
    </fieldset>
  );
}
