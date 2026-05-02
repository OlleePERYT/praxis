"use client";

import { C } from "@/lib/colors";
import { PraxisResult } from "@/lib/engine";

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
  const ueberschussClass =
    result.ueberschuss > 0 ? C.green : result.ueberschuss < 0 ? C.red : C.primary;
  const perMonth = result.ueberschuss / 12;

  return (
    <div
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{ backgroundColor: `${C.white}f0`, borderColor: C.lightBg2 }}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <p className="text-xs" style={{ color: C.lightGray }}>
            Umsatz
          </p>
          <p className="text-lg font-semibold tabular-nums" style={{ color: C.primary }}>
            {formatEuro(result.revenue)}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: C.lightGray }}>
            Personalkosten
          </p>
          <p className="text-lg font-semibold tabular-nums" style={{ color: C.primary }}>
            {formatEuro(result.personalCost)}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: C.lightGray }}>
            Überschuss
          </p>
          <p className="text-lg font-semibold tabular-nums" style={{ color: ueberschussClass }}>
            {formatEuro(result.ueberschuss)}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: C.lightGray }}>
            Überschuss / Monat
          </p>
          <p className="text-lg font-semibold tabular-nums" style={{ color: ueberschussClass }}>
            {formatEuro(perMonth)}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs" style={{ color: C.lightGray }}>
            Personalkostenquote
          </p>
          <p className="text-lg font-semibold tabular-nums" style={{ color: C.primary }}>
            {percentFormatter.format(result.personalCostRatio * 100)} %
          </p>
        </div>
      </div>
    </div>
  );
}
