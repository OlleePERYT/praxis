"use client";

import { RevenueConfigDirect, RevenueConfigMix } from "@/lib/engine";
import { StepSlider } from "./StepSlider";

type RevenuePanelProps = {
  config: RevenueConfigDirect | RevenueConfigMix;
  onChange: (config: RevenueConfigDirect | RevenueConfigMix) => void;
};

const defaultDirect: RevenueConfigDirect = {
  mode: "direct",
  revPerHour: 75,
};

const defaultMix: RevenueConfigMix = {
  mode: "mix",
  gkvPct: 70,
  pkvPct: 30,
  gkvPerTreatment: 35,
  pkvPerTreatment: 49,
  selfPerTreatment: 45,
  treatmentsPerHour: 2,
  utilization: 75,
};

export function RevenuePanel({ config, onChange }: RevenuePanelProps) {
  const selfPct = config.mode === "mix" ? Math.max(0, 100 - config.gkvPct - config.pkvPct) : 0;

  return (
    <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(defaultDirect)}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            config.mode === "direct"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          Direct
        </button>
        <button
          type="button"
          onClick={() => onChange(defaultMix)}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            config.mode === "mix"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          Mix
        </button>
      </div>

      {config.mode === "direct" ? (
        <StepSlider
          label="Erlos pro Stunde"
          value={config.revPerHour}
          min={0}
          max={300}
          step={5}
          unit="€/h"
          onChange={(revPerHour) => onChange({ mode: "direct", revPerHour })}
        />
      ) : (
        <div className="space-y-3">
          <StepSlider
            label="GKV-Anteil"
            value={config.gkvPct}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(gkvPct) => onChange({ ...config, gkvPct })}
          />
          <StepSlider
            label="PKV-Anteil"
            value={config.pkvPct}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(pkvPct) => onChange({ ...config, pkvPct })}
          />
          <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
            Selbstzahler-Anteil: {selfPct} %
          </p>
          <StepSlider
            label="Ø GKV-Verguetung pro Behandlung"
            value={config.gkvPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            onChange={(gkvPerTreatment) => onChange({ ...config, gkvPerTreatment })}
          />
          <StepSlider
            label="Ø PKV-Verguetung pro Behandlung"
            value={config.pkvPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            onChange={(pkvPerTreatment) => onChange({ ...config, pkvPerTreatment })}
          />
          <StepSlider
            label="Ø Selbstzahler pro Behandlung"
            value={config.selfPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            onChange={(selfPerTreatment) => onChange({ ...config, selfPerTreatment })}
          />
          <StepSlider
            label="Behandlungen pro Stunde"
            value={config.treatmentsPerHour}
            min={1}
            max={4}
            step={0.5}
            onChange={(treatmentsPerHour) => onChange({ ...config, treatmentsPerHour })}
          />
          <StepSlider
            label="Auslastung"
            value={config.utilization}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(utilization) => onChange({ ...config, utilization })}
          />
        </div>
      )}
    </section>
  );
}
