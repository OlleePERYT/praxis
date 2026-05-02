"use client";

import { C } from "@/lib/colors";
import type { PraxisResult } from "@/lib/engine";

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
};

export function MetricsCard({ result, sumWeeklyHours }: MetricsCardProps) {
  const totalEff = result.employeeDetails.reduce((s, e) => s + e.effHours, 0);
  const revPerHour =
    totalEff > 0 ? result.revenueTherapy / totalEff : 0;
  const pkQuote = result.personalCostRatio * 100;
  const roomQuote =
    result.revenue === 0 ? 0 : (result.mieteJahr / result.revenue) * 100;
  const surplusQuote =
    result.revenue === 0 ? 0 : (result.ueberschuss / result.revenue) * 100;

  const row = (label: string, value: string, valueColor?: string) => (
    <div className="flex justify-between gap-2 border-b py-2 text-sm last:border-b-0" style={{ borderColor: C.lightBg2 }}>
      <span style={{ color: C.gray }}>{label}</span>
      <span className="font-medium tabular-nums" style={{ color: valueColor ?? C.primary }}>
        {value}
      </span>
    </div>
  );

  return (
    <section
      className="space-y-2 rounded-xl border p-4 shadow-sm"
      style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
    >
      <h2 className="mb-2 text-xl font-semibold" style={{ color: C.primary }}>
        Kennzahlen
      </h2>
      {row("Therapeutenstunden / Woche", `${pct1.format(sumWeeklyHours)} Std.`)}
      {row("Effektive Stunden / Jahr", `${euro0.format(totalEff)} Std.`)}
      {row(
        "Erlös / Anwesenheitsstunde",
        `${pct2.format(revPerHour)} €/h`,
      )}
      {row(
        "Personalkostenquote",
        `${pct1.format(pkQuote)} %`,
        pkQuote > 45 ? C.red : C.primary,
      )}
      {row("Raumkostenquote (nur Miete)", `${pct1.format(roomQuote)} %`)}
      {row(
        "Überschussquote",
        `${pct1.format(surplusQuote)} %`,
        surplusQuote >= 0 ? C.green : C.red,
      )}
    </section>
  );
}
