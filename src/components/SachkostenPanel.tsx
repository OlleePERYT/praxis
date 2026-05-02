"use client";

import { C } from "@/lib/colors";
import {
  getSachkostenJahr,
  type SachkostenConfig,
  type SachkostenConfigDetail,
} from "@/lib/engine";
import {
  sachkostenDetailToDirect,
  sachkostenDirectToDetail,
} from "@/lib/praxis-config";
import { StepSlider } from "./StepSlider";

type SachkostenPanelProps = {
  config: SachkostenConfig;
  onChange: (config: SachkostenConfig) => void;
};

const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export function SachkostenPanel({ config, onChange }: SachkostenPanelProps) {
  const btnActive = (active: boolean) =>
    active
      ? { backgroundColor: C.primary, color: C.white, border: `1px solid ${C.primary}` }
      : { backgroundColor: C.white, color: C.primary, border: `1px solid ${C.lightBg2}` };

  const detailSum = config.mode === "detail" ? getSachkostenJahr(config) : null;

  const setDetailField = <K extends keyof Omit<SachkostenConfigDetail, "mode">>(
    key: K,
    value: number,
  ) => {
    if (config.mode !== "detail") return;
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <section
      className="space-y-4 rounded-xl border p-4 shadow-sm"
      style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
    >
      <p className="text-sm font-medium" style={{ color: C.gray }}>
        Sachkosten (ohne Miete)
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (config.mode === "detail") {
              onChange(sachkostenDetailToDirect(config));
            }
          }}
          className="rounded-md px-3 py-2 text-sm font-medium"
          style={btnActive(config.mode === "direct")}
        >
          Direkt
        </button>
        <button
          type="button"
          onClick={() => {
            if (config.mode === "direct") {
              onChange(sachkostenDirectToDetail(config));
            }
          }}
          className="rounded-md px-3 py-2 text-sm font-medium"
          style={btnActive(config.mode === "detail")}
        >
          Detail
        </button>
      </div>

      {config.mode === "direct" ? (
        <StepSlider
          label="Sachkosten pro Jahr"
          value={config.value}
          min={0}
          max={80000}
          step={1000}
          unit="€"
          onChange={(value) => onChange({ mode: "direct", value })}
        />
      ) : (
        <div className="space-y-3">
          <p
            className="rounded-lg border px-3 py-2 text-sm font-medium tabular-nums"
            style={{
              borderColor: C.lightBg2,
              backgroundColor: C.lightBg,
              color: C.primary,
            }}
          >
            Summe Sachkosten: {euro0.format(detailSum ?? 0)} €
          </p>
          <StepSlider
            label="Raum-Nebenkosten"
            value={config.raumNebenkosten}
            min={0}
            max={30000}
            step={100}
            unit="€"
            onChange={(value) => setDetailField("raumNebenkosten", value)}
          />
          <StepSlider
            label="Material"
            value={config.material}
            min={0}
            max={30000}
            step={100}
            unit="€"
            onChange={(value) => setDetailField("material", value)}
          />
          <StepSlider
            label="Software"
            value={config.software}
            min={0}
            max={20000}
            step={100}
            unit="€"
            onChange={(value) => setDetailField("software", value)}
          />
          <StepSlider
            label="Versicherungen"
            value={config.versicherungen}
            min={0}
            max={15000}
            step={100}
            unit="€"
            onChange={(value) => setDetailField("versicherungen", value)}
          />
          <StepSlider
            label="Marketing"
            value={config.marketing}
            min={0}
            max={20000}
            step={100}
            unit="€"
            onChange={(value) => setDetailField("marketing", value)}
          />
          <StepSlider
            label="Sonstiges"
            value={config.sonstiges}
            min={0}
            max={40000}
            step={100}
            unit="€"
            onChange={(value) => setDetailField("sonstiges", value)}
          />
        </div>
      )}
    </section>
  );
}
