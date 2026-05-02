"use client";

import { C } from "@/lib/colors";
import type {
  PraxisResult,
  RevenueConfigDirect,
  RevenueConfigMix,
} from "@/lib/engine";

const pct1 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const pct2 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

type MetricsCardProps = {
  result: PraxisResult;
  sumWeeklyHours: number;
  revenueConfig: RevenueConfigDirect | RevenueConfigMix;
};

type TileProps = {
  label: string;
  value: string;
  unit?: string;
  valueColor?: string;
  sub?: string;
};

function Tile({ label, value, unit, valueColor, sub }: TileProps) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ borderColor: C.lightBg2, backgroundColor: C.lightBg }}
    >
      <p className="text-xs" style={{ color: C.gray }}>
        {label}
      </p>
      <p className="mt-1 flex items-baseline gap-1">
        <span
          className="text-xl font-semibold tabular-nums sm:text-2xl"
          style={{ color: valueColor ?? C.primary }}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-sm" style={{ color: C.gray }}>
            {unit}
          </span>
        ) : null}
      </p>
      {sub ? (
        <p className="mt-1 text-xs" style={{ color: C.lightGray }}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}

export function MetricsCard({
  result,
  sumWeeklyHours,
  revenueConfig,
}: MetricsCardProps) {
  const totalEff = result.employeeDetails.reduce((s, e) => s + e.effHours, 0);
  const revPerHour = totalEff > 0 ? result.revenueTherapy / totalEff : 0;
  const pkQuote = result.personalCostRatio * 100;
  const roomQuote =
    result.revenue === 0 ? 0 : (result.mieteJahr / result.revenue) * 100;
  const surplusQuote =
    result.revenue === 0 ? 0 : (result.ueberschuss / result.revenue) * 100;

  const gkvRisk =
    revenueConfig.mode === "mix"
      ? {
          euro: result.revenueTherapy * (revenueConfig.gkvPct / 100),
          pct: revenueConfig.gkvPct,
        }
      : null;

  return (
    <section
      className="rounded-xl border p-4 shadow-sm"
      style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
    >
      <h2 className="mb-4 text-xl font-semibold" style={{ color: C.primary }}>
        Kennzahlen
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Tile
          label="Therapeut:innen-Stunden / Woche"
          value={pct1.format(sumWeeklyHours)}
          unit="Std."
        />
        <Tile
          label="Effektive Stunden / Jahr"
          value={euro0.format(totalEff)}
          unit="Std."
        />
        <Tile
          label="Erlös / Anwesenheitsstunde"
          value={pct2.format(revPerHour)}
          unit="€/h"
        />
        <Tile
          label="Personalkostenquote"
          value={pct1.format(pkQuote)}
          unit="%"
          valueColor={pkQuote > 45 ? C.red : C.primary}
        />
        <Tile
          label="Raumkostenquote (nur Miete)"
          value={pct1.format(roomQuote)}
          unit="%"
        />
        <Tile
          label="Überschussquote"
          value={pct1.format(surplusQuote)}
          unit="%"
          valueColor={surplusQuote >= 0 ? C.green : C.red}
        />
        {gkvRisk !== null ? (
          <Tile
            label="GKV-abhängiger Umsatz"
            value={euro0.format(gkvRisk.euro)}
            unit="€"
            sub={`${pct1.format(gkvRisk.pct)} % des Therapie-Umsatzes`}
            valueColor={
              gkvRisk.pct > 70 ? C.red : gkvRisk.pct > 50 ? C.orange : C.primary
            }
          />
        ) : null}
      </div>
    </section>
  );
}
