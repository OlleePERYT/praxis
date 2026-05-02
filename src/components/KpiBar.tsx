"use client";

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
    result.ueberschuss > 0
      ? "text-emerald-600"
      : result.ueberschuss < 0
        ? "text-rose-600"
        : "text-zinc-900";

  return (
    <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 py-3 md:grid-cols-4">
        <div>
          <p className="text-xs text-zinc-500">Umsatz</p>
          <p className="text-lg font-semibold text-zinc-900">{formatEuro(result.revenue)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Personalkosten</p>
          <p className="text-lg font-semibold text-zinc-900">{formatEuro(result.personalCost)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Überschuss</p>
          <p className={`text-lg font-semibold ${ueberschussClass}`}>
            {formatEuro(result.ueberschuss)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Personalkostenquote</p>
          <p className="text-lg font-semibold text-zinc-900">
            {percentFormatter.format(result.personalCostRatio * 100)} %
          </p>
        </div>
      </div>
    </div>
  );
}
