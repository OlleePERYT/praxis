"use client";

import Eyebrow from "@/components/ui/Eyebrow";
import GradientNumber from "@/components/ui/GradientNumber";
import type { PraxisResult } from "@/lib/engine";

type KpiBarProps = {
  result: PraxisResult;
  baseline: { result: PraxisResult } | null;
};

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatEuro(value: number): string {
  return `${currencyFormatter.format(value)} €`;
}

function MiniMetric({
  label,
  value,
  valueClassName = "text-brand-ink",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-brand-border-soft)] bg-white/50 px-3 py-3 backdrop-blur-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {label}
      </div>
      <div
        className={`mt-1 text-base font-bold tabular-nums ${valueClassName}`}
      >
        {value}
      </div>
    </div>
  );
}

export function KpiBar({ result, baseline }: KpiBarProps) {
  const perMonth = result.ueberschuss / 12;
  const pkPct = result.personalCostRatio * 100;
  const pkClass = pkPct > 45 ? "text-red-600" : "text-brand-ink";

  const delta =
    baseline !== null ? result.ueberschuss - baseline.result.ueberschuss : null;
  const showDeltaPill =
    baseline !== null && delta !== null && delta !== 0;

  const ue = result.ueberschuss;
  const absUe = currencyFormatter.format(Math.abs(ue));
  const heroFigure =
    ue > 0 ? `+${absUe} €` : ue < 0 ? `−${absUe} €` : `${absUe} €`;

  const hasEntnahme = result.inhaberEntnahmeJahr > 0;

  const deltaLabel =
    delta === null
      ? ""
      : `${delta > 0 ? "+" : "−"}${currencyFormatter.format(Math.abs(delta))} € ggü. Baseline`;

  return (
    <div className="sticky top-[64px] z-30 mt-4">
      <div className="relative w-full overflow-hidden rounded-3xl border border-[var(--color-brand-border-soft)] bg-white/85 px-8 py-6 shadow-[var(--shadow-glow-md)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 80% 50%, rgba(82,183,136,0.12) 0%, transparent 60%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="relative min-w-0 flex-1 md:max-w-[min(100%,28rem)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Eyebrow>Praxisüberschuss</Eyebrow>
              {showDeltaPill ? (
                <span
                  className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold tabular-nums ${
                    delta! > 0
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {deltaLabel}
                </span>
              ) : null}
            </div>

            <div className="mt-3">
              <GradientNumber
                size="xl"
                tone={result.ueberschuss < 0 ? "negative" : "positive"}
              >
                {heroFigure}
              </GradientNumber>
            </div>

            <p className="mt-2 text-sm tabular-nums text-brand-muted">
              {formatEuro(perMonth)}/Monat
            </p>

            {hasEntnahme ? (
              <div className="mt-6 border-t border-[var(--color-brand-border-soft)] pt-4">
                <p className="text-sm text-brand-muted">
                  Nach Entnahme: {formatEuro(result.ueberschussNachEntnahme)}
                  /Jahr
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid w-full shrink-0 grid-cols-3 gap-3 sm:gap-4 md:max-w-md md:flex-1">
            <MiniMetric label="Umsatz" value={formatEuro(result.revenue)} />
            <MiniMetric label="Kosten" value={formatEuro(result.totalCost)} />
            <MiniMetric
              label="PK-Quote"
              value={`${percentFormatter.format(pkPct)} %`}
              valueClassName={pkClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
