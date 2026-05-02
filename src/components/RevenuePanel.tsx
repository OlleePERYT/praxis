"use client";

import { C } from "@/lib/colors";
import {
  mixChannelEuroPerHour,
  type RevenueConfigDirect,
  type RevenueConfigMix,
} from "@/lib/engine";
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

export function RevenuePanel({ config, onChange }: RevenuePanelProps) {
  const selfPct =
    config.mode === "mix"
      ? Math.max(0, 100 - config.gkvPct - config.pkvPct - config.bgPct)
      : 0;

  const btnActive = (active: boolean) =>
    active
      ? { backgroundColor: C.primary, color: C.white, border: `1px solid ${C.primary}` }
      : { backgroundColor: C.white, color: C.primary, border: `1px solid ${C.lightBg2}` };

  return (
    <section
      className="space-y-4 rounded-xl border p-4 shadow-sm"
      style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(defaultDirect)}
          className="rounded-md px-3 py-2 text-sm font-medium"
          style={btnActive(config.mode === "direct")}
        >
          Direkt
        </button>
        <button
          type="button"
          onClick={() => onChange(defaultMix)}
          className="rounded-md px-3 py-2 text-sm font-medium"
          style={btnActive(config.mode === "mix")}
        >
          Mix
        </button>
      </div>

      {config.mode === "direct" ? (
        <StepSlider
          label="Erlös pro Stunde"
          value={config.revPerHour}
          min={0}
          max={300}
          step={1}
          unit="€/h"
          hint="35 € (nur GKV) | 65 € (Mix) | 85 € (Premium)"
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
            hint="0 % | 60 % (typisch) | 100 %"
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
          <StepSlider
            label="BG-Anteil"
            value={config.bgPct}
            min={0}
            max={100}
            step={5}
            unit="%"
            hint="0 % | 5 % (typisch) | 20 %"
            onChange={(bgPct) => onChange({ ...config, bgPct })}
          />
          <p
            className="rounded-md px-3 py-2 text-sm"
            style={{ backgroundColor: C.lightBg, color: C.gray }}
          >
            Selbstzahler-Anteil: {selfPct} %
          </p>
          <StepSlider
            label="Ø GKV-Vergütung pro Behandlung"
            value={config.gkvPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            onChange={(gkvPerTreatment) => onChange({ ...config, gkvPerTreatment })}
          />
          <StepSlider
            label="Ø PKV-Vergütung pro Behandlung"
            value={config.pkvPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            onChange={(pkvPerTreatment) => onChange({ ...config, pkvPerTreatment })}
          />
          <StepSlider
            label="Ø BG-Vergütung pro Behandlung"
            value={config.bgPerTreatment}
            min={0}
            max={100}
            step={0.5}
            unit="€"
            hint="meist über GKV, unter PKV"
            onChange={(bgPerTreatment) => onChange({ ...config, bgPerTreatment })}
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
            hint="50 % | 70 % (realistisch) | 95 %"
            onChange={(utilization) => onChange({ ...config, utilization })}
          />

          <MixSummary config={config} />
        </div>
      )}
    </section>
  );
}

function MixSummary({ config }: { config: RevenueConfigMix }) {
  const parts = mixChannelEuroPerHour(config);
  const u = config.utilization;
  const tph = config.treatmentsPerHour;

  return (
    <div
      className="space-y-2 rounded-lg border p-3 text-sm"
      style={{ borderColor: C.accent, backgroundColor: C.lightBg }}
    >
      <p className="font-semibold" style={{ color: C.primary }}>
        Erlös-Zusammenfassung (Mix)
      </p>
      <p style={{ color: C.gray }}>
        Effektiver Erlös / Anwesenheitsstunde:{" "}
        <strong style={{ color: C.primary }}>{fmt2.format(parts.effective)} €/h</strong>
      </p>
      <ul className="list-inside list-disc space-y-1" style={{ color: C.gray }}>
        <li>
          GKV ({config.gkvPct}%): {fmt2.format(config.gkvPerTreatment)} €/Beh. × {tph} Beh./Std. ×{" "}
          {u}% = {fmt2.format(parts.gkv)} €/Std.
        </li>
        <li>
          PKV ({config.pkvPct}%): {fmt2.format(config.pkvPerTreatment)} €/Beh. × {tph} Beh./Std. ×{" "}
          {u}% = {fmt2.format(parts.pkv)} €/Std.
        </li>
        <li>
          BG ({config.bgPct}%): {fmt2.format(config.bgPerTreatment)} €/Beh. × {tph} Beh./Std. × {u}% ={" "}
          {fmt2.format(parts.bg)} €/Std.
        </li>
        <li>
          Selbstzahler ({parts.selfPct}%): {fmt2.format(config.selfPerTreatment)} €/Beh. × {tph}{" "}
          Beh./Std. × {u}% = {fmt2.format(parts.self)} €/Std.
        </li>
      </ul>
    </div>
  );
}
