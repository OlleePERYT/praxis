"use client";

import { C } from "@/lib/colors";
import type { PraxisResult } from "@/lib/engine";

type KpiBarProps = {
  result: PraxisResult;
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

export function KpiBar({ result }: KpiBarProps) {
  const ueberschussColor =
    result.ueberschuss > 0
      ? C.green
      : result.ueberschuss < 0
        ? C.red
        : C.primary;
  const perMonth = result.ueberschuss / 12;
  const pkPct = result.personalCostRatio * 100;
  const pkColor = pkPct > 45 ? C.red : C.primary;

  return (
    <div
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{ backgroundColor: `${C.white}f0`, borderColor: C.lightBg2 }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        {/* Hero: Praxisüberschuss */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm font-medium" style={{ color: C.gray }}>
            Praxisüberschuss
          </span>
          <span
            className="text-2xl font-bold tabular-nums sm:text-3xl"
            style={{ color: ueberschussColor }}
          >
            {formatEuro(result.ueberschuss)} / Jahr
          </span>
          <span className="text-sm tabular-nums" style={{ color: C.lightGray }}>
            · {formatEuro(perMonth)} / Monat
          </span>
        </div>

        {/* Sekundärwerte */}
        <div
          className="mt-2 flex flex-wrap gap-x-5 gap-y-1 border-t pt-2 text-sm"
          style={{ borderColor: C.lightBg2 }}
        >
          <span style={{ color: C.gray }}>
            Umsatz{" "}
            <strong className="tabular-nums" style={{ color: C.primary }}>
              {formatEuro(result.revenue)}
            </strong>
          </span>
          <span style={{ color: C.lightGray }}>·</span>
          <span style={{ color: C.gray }}>
            Kosten{" "}
            <strong className="tabular-nums" style={{ color: C.primary }}>
              {formatEuro(result.totalCost)}
            </strong>
          </span>
          <span style={{ color: C.lightGray }}>·</span>
          <span style={{ color: C.gray }}>
            Personalkostenquote{" "}
            <strong className="tabular-nums" style={{ color: pkColor }}>
              {percentFormatter.format(pkPct)} %
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
