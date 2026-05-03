"use client";

import { useEffect } from "react";
import {
  mixChannelEuroPerHour,
  type RevenueConfigDirect,
  type RevenueConfigMix,
} from "@/lib/engine";
import Card from "./ui/Card";
import Eyebrow from "./ui/Eyebrow";
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
  bgPct: 0,
  gkvPerTreatment: 35,
  pkvPerTreatment: 49,
  bgPerTreatment: 38,
  selfPerTreatment: 45,
  treatmentsPerHour: 2,
  utilization: 75,
};

const fmt2 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pctLab = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

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

export function RevenuePanel({ config, onChange }: RevenuePanelProps) {
  const selfPct =
    config.mode === "mix"
      ? Math.max(0, 100 - config.gkvPct - config.pkvPct - config.bgPct)
      : 0;

  useEffect(() => {
    if (config.mode === "direct") {
      const revPerHour = clamp(config.revPerHour, 30, 200);
      if (revPerHour !== config.revPerHour) {
        onChange({ mode: "direct", revPerHour });
      }
      return;
    }
    const utilization = clamp(config.utilization, 50, 95);
    const treatmentsPerHour = clamp(config.treatmentsPerHour, 1, 4);
    if (
      utilization !== config.utilization ||
      treatmentsPerHour !== config.treatmentsPerHour
    ) {
      onChange({ ...config, utilization, treatmentsPerHour });
    }
  }, [config, onChange]);

  return (
    <Card variant="default">
      <Eyebrow>Modell</Eyebrow>
      <h3 className="mb-4 mt-4 text-xl font-bold text-brand-ink">
        Erlös-Modell
      </h3>

      <div className="mb-6 inline-flex rounded-full bg-brand-bg p-1">
        <ModePill
          active={config.mode === "direct"}
          onClick={() => onChange(defaultDirect)}
        >
          Direkt
        </ModePill>
        <ModePill
          active={config.mode === "mix"}
          onClick={() => onChange(defaultMix)}
        >
          Mix
        </ModePill>
      </div>

      {config.mode === "direct" ? (
        <StepSlider
          label="Erlös pro Stunde"
          value={config.revPerHour}
          min={30}
          max={200}
          step={1}
          unit="€/h"
          hint="35 € (nur GKV) | 65 € (Mix) | 85 € (Premium)"
          onChange={(revPerHour) => onChange({ mode: "direct", revPerHour })}
        />
      ) : (
        <div className="space-y-1">
          <StepSlider
            label={`GKV-Anteil (${pctLab.format(config.gkvPct)} %)`}
            value={config.gkvPct}
            min={0}
            max={100}
            step={5}
            unit="%"
            hint="0 % | 60 % (typisch) | 100 %"
            onChange={(gkvPct) => onChange({ ...config, gkvPct })}
          />
          <StepSlider
            label={`PKV-Anteil (${pctLab.format(config.pkvPct)} %)`}
            value={config.pkvPct}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(pkvPct) => onChange({ ...config, pkvPct })}
          />
          <StepSlider
            label={`BG-Anteil (${pctLab.format(config.bgPct)} %)`}
            value={config.bgPct}
            min={0}
            max={100}
            step={5}
            unit="%"
            hint="0 % | 5 % (typisch) | 20 %"
            onChange={(bgPct) => onChange({ ...config, bgPct })}
          />
          <p className="mb-3 px-4 text-xs text-brand-muted">
            Selbstzahler-Anteil (Rest):{" "}
            <span className="font-semibold tabular-nums text-brand-text">
              {pctLab.format(selfPct)} %
            </span>
            {config.gkvPct + config.pkvPct + config.bgPct > 100
              ? " — über 100 % zusammen → Selbstzahler auf 0 % begrenzt"
              : null}
          </p>

          <StepSlider
            label="Ø GKV €/Behandlung"
            value={config.gkvPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            onChange={(gkvPerTreatment) =>
              onChange({ ...config, gkvPerTreatment })
            }
          />
          <StepSlider
            label="Ø PKV €/Behandlung"
            value={config.pkvPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            onChange={(pkvPerTreatment) =>
              onChange({ ...config, pkvPerTreatment })
            }
          />
          <StepSlider
            label="Ø BG €/Behandlung"
            value={config.bgPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            hint="meist über GKV, unter PKV"
            onChange={(bgPerTreatment) =>
              onChange({ ...config, bgPerTreatment })
            }
          />
          <StepSlider
            label="Ø Selbstzahler €/Behandlung"
            value={config.selfPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            onChange={(selfPerTreatment) =>
              onChange({ ...config, selfPerTreatment })
            }
          />
          <StepSlider
            label="Behandlungen pro Stunde"
            value={config.treatmentsPerHour}
            min={1}
            max={4}
            step={0.1}
            unit="Beh./Std."
            hint="1,0 … 4,0"
            onChange={(treatmentsPerHour) =>
              onChange({ ...config, treatmentsPerHour })
            }
          />
          <StepSlider
            label="Auslastung"
            value={config.utilization}
            min={50}
            max={95}
            step={1}
            unit="%"
            hint="50 % … 95 %"
            onChange={(utilization) => onChange({ ...config, utilization })}
          />

          <MixSummary config={config} />
        </div>
      )}
    </Card>
  );
}

function MixSummary({ config }: { config: RevenueConfigMix }) {
  const parts = mixChannelEuroPerHour(config);
  const selfPct = parts.selfPct;
  const avgPerTreatment =
    (config.gkvPct * config.gkvPerTreatment +
      config.pkvPct * config.pkvPerTreatment +
      config.bgPct * config.bgPerTreatment +
      selfPct * config.selfPerTreatment) /
    100;

  const line = [
    `GKV ${fmt2.format(parts.gkv)} €/h`,
    `PKV ${fmt2.format(parts.pkv)} €/h`,
    `BG ${fmt2.format(parts.bg)} €/h`,
    `Selbstzahler ${fmt2.format(parts.self)} €/h`,
  ].join(" · ");

  return (
    <div
      className="mt-4 rounded-xl border border-[var(--color-brand-border-accent)] bg-[var(--color-brand-surface-cool)] p-4 text-sm text-brand-text"
    >
      <p className="text-base font-semibold text-brand-ink">
        Ø €/Behandlung (gewichtet):{" "}
        <span className="tabular-nums">{fmt2.format(avgPerTreatment)} €</span>
      </p>
      <p className="mt-2 text-base font-semibold text-brand-ink">
        Effektiver €/Anwesenheitsstunde:{" "}
        <span className="tabular-nums">{fmt2.format(parts.effective)} €/h</span>
      </p>
      <p className="mt-3 text-xs leading-relaxed text-brand-muted">{line}</p>
    </div>
  );
}
