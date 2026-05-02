"use client";

import type {
  Employee,
  PraxisResult,
  SachkostenConfig,
} from "@/lib/engine";
import Card from "./ui/Card";
import Eyebrow from "./ui/Eyebrow";
import GradientNumber from "./ui/GradientNumber";

const euro = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});

const pct1 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const rowHover =
  "flex cursor-default flex-wrap justify-between gap-x-4 gap-y-1 py-2.5 transition-colors hover:bg-brand-bg/40";

const sectionBorder = "border-t border-[var(--color-brand-border-soft)]";

type ProfitLossProps = {
  result: PraxisResult;
  employees: Employee[];
  sachkosten: SachkostenConfig;
};

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-brand-primary">
      {title}
    </p>
  );
}

function SimpleRow({
  label,
  value,
  bold,
  labelClassName = "text-brand-text",
}: {
  label: string;
  value: number;
  bold?: boolean;
  labelClassName?: string;
}) {
  return (
    <div className={rowHover}>
      <span className={labelClassName}>{label}</span>
      <span
        className={`text-right tabular-nums ${bold ? "font-bold text-brand-ink" : "text-brand-ink"}`}
      >
        {euro.format(value)} €
      </span>
    </div>
  );
}

function DbPill({ db }: { db: number }) {
  const positive = db > 0;
  const cls = positive
    ? "border border-green-200 bg-green-50 text-green-700"
    : "border border-red-200 bg-red-50 text-red-700";
  const sign = db >= 0 ? "" : "−";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      DB: {sign}
      {euro.format(Math.abs(db))} €/Jahr
    </span>
  );
}

export function ProfitLoss({ result, employees, sachkosten }: ProfitLossProps) {
  const active = employees
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.hours > 0);

  const totalEff = result.employeeDetails.reduce((s, e) => s + e.effHours, 0);

  const detailLines =
    sachkosten.mode === "detail"
      ? ([
          ["Raum-Nebenkosten", sachkosten.raumNebenkosten],
          ["Material", sachkosten.material],
          ["Software", sachkosten.software],
          ["Versicherungen", sachkosten.versicherungen],
          ["Marketing", sachkosten.marketing],
          ["Sonstiges", sachkosten.sonstiges],
        ] as const)
      : null;

  return (
    <Card variant="default">
      <Eyebrow>Gewinn- und Verlustrechnung</Eyebrow>
      <h3 className="mb-4 mt-4 text-xl font-bold text-brand-ink">Praxis-P&amp;L</h3>

      <div>
        <SectionHeader title="Umsatz" />
        <SimpleRow label="Therapie-Erlöse" value={result.revenueTherapy} />
        {result.untermieteJahr > 0 ? (
          <SimpleRow label="Untermiete (Jahr)" value={result.untermieteJahr} />
        ) : null}
        {result.handelswareJahr > 0 ? (
          <SimpleRow label="Handelsware (Jahr)" value={result.handelswareJahr} />
        ) : null}
        <div className={`mt-2 border-t border-[var(--color-brand-border-soft)] pt-2 ${rowHover}`}>
          <span className="font-bold text-brand-ink">Summe Umsatz</span>
          <span className="text-right font-bold tabular-nums text-brand-ink">
            {euro.format(result.totalIncome)} €
          </span>
        </div>
      </div>

      <div className={`mt-4 ${sectionBorder} pt-4`}>
        <SectionHeader title="Personal" />
        {active.map(({ e, i }) => {
          const d = result.employeeDetails[i];
          if (!d) return null;
          const maRevShare =
            totalEff > 0 ? result.revenueTherapy * (d.effHours / totalEff) : 0;
          const maDB = maRevShare - d.cost - d.trainingCost;
          const hoursLine = `${pct1.format(e.hours)} Std./Woche · ${euro.format(d.effHours)} Std./Jahr eff.`;
          return (
            <div
              key={i}
              className={`${rowHover} grid grid-cols-1 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start`}
            >
              <div className="min-w-0">
                <p className="text-brand-text">{e.name.trim() || `Therapeut:in ${i + 1}`}</p>
                <p className="text-xs text-brand-muted">{hoursLine}</p>
              </div>
              <div className="flex flex-col items-start gap-1 sm:items-end sm:text-right">
                <span className="tabular-nums text-brand-ink">
                  {euro.format(d.cost)} €
                </span>
                <DbPill db={maDB} />
              </div>
            </div>
          );
        })}
        {result.gfGehaltJahr > 0 ? (
          <SimpleRow label="GF-Gehalt (Jahr)" value={result.gfGehaltJahr} />
        ) : null}
        <div className={`mt-2 border-t border-[var(--color-brand-border-soft)] pt-2 ${rowHover}`}>
          <span className="font-bold text-brand-ink">Summe Personal</span>
          <span className="text-right font-bold tabular-nums text-brand-ink">
            {euro.format(result.personalCost)} €
          </span>
        </div>
      </div>

      <div className={`mt-4 ${sectionBorder} pt-4`}>
        <SectionHeader title="Sachkosten" />
        {detailLines !== null ? (
          <>
            {detailLines.map(([label, val]) => (
              <SimpleRow key={label} label={label} value={val} />
            ))}
          </>
        ) : (
          <SimpleRow label="Sachkosten (Direct)" value={result.sachkostenJahr} />
        )}
        <SimpleRow label="Miete (Jahr)" value={result.mieteJahr} />
        <SimpleRow label="Weiterbildungskosten gesamt" value={result.trainingCostTotal} />
        <div className={`mt-2 border-t border-[var(--color-brand-border-soft)] pt-2 ${rowHover}`}>
          <span className="font-bold text-brand-ink">Summe Sachkosten</span>
          <span className="text-right font-bold tabular-nums text-brand-ink">
            {euro.format(result.totalSach)} €
          </span>
        </div>
      </div>

      <div className={`mt-6 ${sectionBorder} pt-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <span className="text-sm font-semibold text-brand-ink">Praxisüberschuss</span>
          <GradientNumber
            size="md"
            tone={result.ueberschuss >= 0 ? "positive" : "negative"}
          >
            {euro.format(result.ueberschuss)} €
          </GradientNumber>
        </div>

        {result.inhaberEntnahmeJahr > 0 ? (
          <>
            <SimpleRow
              label="Inhaberentnahme (Jahr)"
              value={-result.inhaberEntnahmeJahr}
              labelClassName="text-brand-muted"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="text-sm font-medium text-brand-ink">
                Verbleibend nach Entnahme
              </span>
              <div className="origin-right scale-[0.92]">
                <GradientNumber
                  size="md"
                  tone={
                    result.ueberschussNachEntnahme >= 0 ? "positive" : "negative"
                  }
                >
                  {euro.format(result.ueberschussNachEntnahme)} €
                </GradientNumber>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Card>
  );
}
