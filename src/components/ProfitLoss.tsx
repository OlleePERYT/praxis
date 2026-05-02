"use client";

import { C } from "@/lib/colors";
import type { Employee, PraxisResult } from "@/lib/engine";

const euro = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});

type ProfitLossProps = {
  result: PraxisResult;
  employees: Employee[];
};

export function ProfitLoss({ result, employees }: ProfitLossProps) {
  const active = employees
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.hours > 0);

  const totalEff = result.employeeDetails.reduce((s, e) => s + e.effHours, 0);

  return (
    <section
      className="space-y-4 rounded-xl border p-4 shadow-sm"
      style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
    >
      <h2 className="text-xl font-semibold" style={{ color: C.primary }}>
        Wirtschaftlichkeit (P&amp;L)
      </h2>

      <div className="space-y-2 text-sm">
        <p className="font-medium" style={{ color: C.gray }}>
          Umsatz
        </p>
        <Row label="Therapie-Erlöse" value={result.revenueTherapy} />
        {result.untermieteJahr > 0 ? (
          <Row label="Untermiete" value={result.untermieteJahr} />
        ) : null}
        <Row label="Σ Umsatz" value={result.totalIncome} bold />
      </div>

      <div className="space-y-2 border-t pt-3 text-sm" style={{ borderColor: C.lightBg2 }}>
        <p className="font-medium" style={{ color: C.gray }}>
          Personalkosten
        </p>
        {active.map(({ e, i }) => {
          const d = result.employeeDetails[i];
          if (!d) return null;
          const maRevShare =
            totalEff > 0 ? result.revenueTherapy * (d.effHours / totalEff) : 0;
          const maDB = maRevShare - d.cost;
          return (
            <Row
              key={i}
              label={`Personal ${e.name} (inkl. AG-Anteil)`}
              value={d.cost}
              db={maDB}
            />
          );
        })}
        <Row label="Σ Personalkosten" value={result.personalCost} bold />
      </div>

      <div className="space-y-2 border-t pt-3 text-sm" style={{ borderColor: C.lightBg2 }}>
        <p className="font-medium" style={{ color: C.gray }}>
          Sachkosten
        </p>
        <Row label="Miete (Jahr)" value={result.mieteJahr} />
        <Row label="Übrige Sachkosten (Jahr)" value={result.sachkostenJahr} />
      </div>

      <div className="border-t pt-3" style={{ borderColor: C.lightBg2 }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-lg font-bold" style={{ color: C.primary }}>
            PRAXISÜBERSCHUSS
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: result.ueberschuss >= 0 ? C.green : C.red }}
          >
            {euro.format(result.ueberschuss)} €
          </span>
        </div>
        {result.ueberschuss < 0 ? (
          <p className="mt-2 text-sm" style={{ color: C.red }}>
            Negativer Überschuss: Kosten übersteigen die Einnahmen in dieser Planung.
          </p>
        ) : (
          <p className="mt-2 text-sm" style={{ color: C.green }}>
            Vor Steuern und vor Inhaberentnahme.
          </p>
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  bold,
  db,
}: {
  label: string;
  value: number;
  bold?: boolean;
  db?: number;
}) {
  const valueSpan = (
    <span
      className={`tabular-nums ${bold ? "font-semibold" : ""}`}
      style={{ color: C.primary }}
    >
      {euro.format(value)} €
    </span>
  );

  return (
    <div className="flex flex-wrap justify-between gap-2">
      <span style={{ color: C.gray }}>{label}</span>
      {db !== undefined ? (
        <span className="flex gap-4">
          {valueSpan}
          <span
            className="tabular-nums text-sm font-medium"
            style={{ color: db >= 0 ? C.green : C.red }}
          >
            DB: {db >= 0 ? "+" : "−"}
            {euro.format(Math.abs(db))} €
          </span>
        </span>
      ) : (
        valueSpan
      )}
    </div>
  );
}
