"use client";

import { useEffect } from "react";
import {
  getSachkostenJahr,
  type SachkostenConfig,
  type SachkostenConfigDetail,
} from "@/lib/engine";
import {
  sachkostenDetailToDirect,
  sachkostenDirectToDetail,
} from "@/lib/praxis-config";
import Card from "./ui/Card";
import Eyebrow from "./ui/Eyebrow";
import { StepSlider } from "./StepSlider";

type SachkostenPanelProps = {
  config: SachkostenConfig;
  onChange: (config: SachkostenConfig) => void;
};

const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

function ModePill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-white text-brand-primary shadow-sm"
          : "text-brand-muted hover:text-brand-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function SachkostenPanel({ config, onChange }: SachkostenPanelProps) {
  const detailSum = config.mode === "detail" ? getSachkostenJahr(config) : null;

  useEffect(() => {
    if (config.mode !== "direct") return;
    const value = Math.min(100000, Math.max(5000, config.value));
    if (value !== config.value) {
      onChange({ mode: "direct", value });
    }
  }, [config, onChange]);

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
    <Card variant="default">
      <Eyebrow>Sachkosten</Eyebrow>
      <h3 className="mb-4 mt-4 text-xl font-bold text-brand-ink">Sachkosten</h3>

      <div className="mb-6 inline-flex rounded-full bg-brand-bg p-1">
        <ModePill
          active={config.mode === "direct"}
          onClick={() => {
            if (config.mode === "detail") {
              onChange(sachkostenDetailToDirect(config));
            }
          }}
        >
          Direct
        </ModePill>
        <ModePill
          active={config.mode === "detail"}
          onClick={() => {
            if (config.mode === "direct") {
              onChange(sachkostenDirectToDetail(config));
            }
          }}
        >
          Detail
        </ModePill>
      </div>

      {config.mode === "direct" ? (
        <StepSlider
          label="Sachkosten gesamt/Jahr"
          value={config.value}
          min={5000}
          max={100000}
          step={500}
          unit="€"
          onChange={(value) => onChange({ mode: "direct", value })}
        />
      ) : (
        <div className="space-y-1">
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
            label="Software & Lizenzen"
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

          <div
            className="mt-4 rounded-xl border border-[var(--color-brand-border-accent)] bg-[var(--color-brand-surface-cool)] p-4"
          >
            <p className="text-base font-semibold text-brand-ink tabular-nums">
              Summe: {euro0.format(detailSum ?? 0)} €/Jahr
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
