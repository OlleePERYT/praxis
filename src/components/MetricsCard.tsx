"use client";

import type { ReactNode } from "react";
import type {
  PraxisResult,
  RevenueConfigDirect,
  RevenueConfigMix,
} from "@/lib/engine";
import Card from "./ui/Card";
import Eyebrow from "./ui/Eyebrow";
import GradientNumber from "./ui/GradientNumber";

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

function riskTierLabel(pct: number): "high" | "medium" | "low" {
  if (pct > 70) return "high";
  if (pct >= 50) return "medium";
  return "low";
}

function RiskPill({ pct }: { pct: number }) {
  const tier = riskTierLabel(pct);
  const label =
    tier === "high"
      ? "Risiko hoch"
      : tier === "medium"
        ? "Risiko mittel"
        : "Risiko niedrig";
  const cls =
    tier === "high"
      ? "bg-red-50 text-red-600 border border-red-200"
      : tier === "medium"
        ? "bg-orange-50 text-orange-600 border border-orange-200"
        : "bg-green-50 text-green-700 border border-green-200";

  return (
    <span
      className={`absolute right-3 top-3 inline-block text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${cls}`}
    >
      {label}
    </span>
  );
}

type TileProps = {
  label: string;
  value: ReactNode;
  foot: string;
  riskPct?: number;
};

function Tile({ label, value, foot, riskPct }: TileProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[var(--color-brand-border-soft)] bg-white p-5 transition-colors hover:border-brand-primary/30"
    >
      {riskPct !== undefined ? <RiskPill pct={riskPct} /> : null}
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {label}
      </p>
      <div className="my-2 flex items-baseline">{value}</div>
      <p className="text-xs text-brand-muted">{foot}</p>
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
    <Card variant="glow">
      <Eyebrow>Kennzahlen</Eyebrow>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Tile
          label="Therapeut:innen-Stunden/Woche"
          value={
            <GradientNumber size="md" tone="positive">
              {pct1.format(sumWeeklyHours)}
            </GradientNumber>
          }
          foot="Std."
        />
        <Tile
          label="Effektive Stunden/Jahr"
          value={
            <GradientNumber size="md" tone="positive">
              {euro0.format(totalEff)}
            </GradientNumber>
          }
          foot="Std."
        />
        <Tile
          label="Erlös/Anwesenheitsstunde"
          value={
            <GradientNumber size="md" tone="positive">
              {pct2.format(revPerHour)}
            </GradientNumber>
          }
          foot="€/h"
        />
        <Tile
          label="Personalkostenquote"
          value={
            <GradientNumber
              size="md"
              tone={pkQuote > 45 ? "negative" : "positive"}
            >
              {pct1.format(pkQuote)} %
            </GradientNumber>
          }
          foot="%"
          riskPct={pkQuote}
        />
        <Tile
          label="Raumkostenquote"
          value={
            <GradientNumber size="md" tone="positive">
              {pct1.format(roomQuote)} %
            </GradientNumber>
          }
          foot="%"
        />
        <Tile
          label="Überschussquote"
          value={
            <GradientNumber
              size="md"
              tone={surplusQuote < 0 ? "negative" : "positive"}
            >
              {pct1.format(surplusQuote)} %
            </GradientNumber>
          }
          foot="%"
        />
        {gkvRisk !== null ? (
          <Tile
            label="GKV-abhängiger Umsatz"
            value={
              <GradientNumber
                size="md"
                tone={gkvRisk.pct > 70 ? "negative" : "positive"}
              >
                {euro0.format(gkvRisk.euro)}
              </GradientNumber>
            }
            foot={`${pct1.format(gkvRisk.pct)} % des Therapie-Umsatzes`}
            riskPct={gkvRisk.pct}
          />
        ) : null}
      </div>
    </Card>
  );
}
