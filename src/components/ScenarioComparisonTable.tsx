"use client";

import type { ReactNode } from "react";
import GradientNumber from "@/components/ui/GradientNumber";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export type ScenarioComparisonTableKpis = {
  ueberschuss: number;
  revenue: number;
  totalCost: number;
  personalCostRatio: number;
  totalEffHours: number;
  gkvAnteilProzent: number | null;
};

export type ScenarioComparisonTableRow = {
  id: string;
  name: string;
  isCurrent: boolean;
  kpis: ScenarioComparisonTableKpis;
};

type ScenarioComparisonTableProps = {
  scenarios: ScenarioComparisonTableRow[];
  onGoToCockpit?: () => void;
};

const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const pct1 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const hours0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

function formatEuro(value: number): string {
  return `${euro0.format(value)} €`;
}

function DeltaEuro({
  currentVal,
  val,
  inverted,
}: {
  currentVal: number;
  val: number;
  inverted?: boolean;
}) {
  const diff = val - currentVal;
  if (diff === 0) {
    return <span className="text-xs text-brand-muted">±0</span>;
  }
  const abs = euro0.format(Math.abs(diff));
  const label = `${diff > 0 ? "+" : "−"}${abs} €`;
  const good = inverted ? diff < 0 : diff > 0;
  const bad = inverted ? diff > 0 : diff < 0;
  const cls = good
    ? "text-xs font-semibold text-brand-primary"
    : bad
      ? "text-xs font-semibold text-red-600"
      : "text-xs text-brand-muted";
  return <span className={cls}>{label}</span>;
}

function DeltaPctPoints({
  currentRatio,
  ratio,
}: {
  currentRatio: number;
  ratio: number;
}) {
  const pp = (ratio - currentRatio) * 100;
  if (Math.abs(pp) < 1e-9) {
    return <span className="text-xs text-brand-muted">±0</span>;
  }
  const formatted = pct1.format(Math.abs(pp));
  const label = `${pp > 0 ? "+" : "−"}${formatted} PP`;
  const good = pp < 0;
  const bad = pp > 0;
  const cls = good
    ? "text-xs font-semibold text-brand-primary"
    : bad
      ? "text-xs font-semibold text-red-600"
      : "text-xs text-brand-muted";
  return <span className={cls}>{label}</span>;
}

function DeltaHours({ currentVal, val }: { currentVal: number; val: number }) {
  const diff = Math.round(val - currentVal);
  if (diff === 0) {
    return <span className="text-xs text-brand-muted">±0</span>;
  }
  const abs = hours0.format(Math.abs(diff));
  const label = `${diff > 0 ? "+" : "−"}${abs}`;
  return <span className="text-xs text-brand-muted">{label}</span>;
}

function DeltaGkv({
  currentPct,
  pct,
}: {
  currentPct: number | null;
  pct: number | null;
}) {
  if (currentPct === null || pct === null) {
    return <span className="text-xs text-brand-muted">—</span>;
  }
  const diff = pct - currentPct;
  if (Math.abs(diff) < 1e-9) {
    return <span className="text-xs text-brand-muted">±0</span>;
  }
  const formatted = pct1.format(Math.abs(diff));
  const label = `${diff > 0 ? "+" : "−"}${formatted} PP`;
  return <span className="text-xs text-brand-muted">{label}</span>;
}

function renderDelta(
  rowKey: string,
  ck: ScenarioComparisonTableKpis,
  vk: ScenarioComparisonTableKpis,
): ReactNode {
  switch (rowKey) {
    case "ueberschuss":
      return <DeltaEuro currentVal={ck.ueberschuss} val={vk.ueberschuss} />;
    case "revenue":
      return <DeltaEuro currentVal={ck.revenue} val={vk.revenue} />;
    case "totalCost":
      return <DeltaEuro currentVal={ck.totalCost} val={vk.totalCost} inverted />;
    case "personalCostRatio":
      return (
        <DeltaPctPoints currentRatio={ck.personalCostRatio} ratio={vk.personalCostRatio} />
      );
    case "totalEffHours":
      return <DeltaHours currentVal={ck.totalEffHours} val={vk.totalEffHours} />;
    case "gkv":
      return <DeltaGkv currentPct={ck.gkvAnteilProzent} pct={vk.gkvAnteilProzent} />;
    default:
      return null;
  }
}

function formatCell(rowKey: string, kpis: ScenarioComparisonTableKpis): string {
  switch (rowKey) {
    case "ueberschuss":
      return formatEuro(kpis.ueberschuss);
    case "revenue":
      return formatEuro(kpis.revenue);
    case "totalCost":
      return formatEuro(kpis.totalCost);
    case "personalCostRatio":
      return `${pct1.format(kpis.personalCostRatio * 100)} %`;
    case "totalEffHours":
      return `${hours0.format(kpis.totalEffHours)} Std./Jahr`;
    case "gkv":
      return kpis.gkvAnteilProzent === null
        ? "—"
        : `${pct1.format(kpis.gkvAnteilProzent)} %`;
    default:
      return "";
  }
}

export function ScenarioComparisonTable({
  scenarios,
  onGoToCockpit,
}: ScenarioComparisonTableProps) {
  const current = scenarios.find((s) => s.isCurrent);
  const onlyCurrent = scenarios.length <= 1;

  if (onlyCurrent || !current) {
    return (
      <Card variant="default" contentClassName="p-6">
        <Eyebrow>Detail</Eyebrow>
        <h3 className="mb-2 mt-3 text-xl font-bold text-brand-ink">
          Kennzahlen im Vergleich
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-brand-text">
          Speichern Sie ein Szenario, um Vergleiche zu sehen. Nutzen Sie „Aktuellen Stand merken“ und
          vergleichen Sie dann mit zukünftigen Änderungen.
        </p>
        {onGoToCockpit ? (
          <button
            type="button"
            onClick={onGoToCockpit}
            className="mt-4 text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
          >
            → Zum Cockpit
          </button>
        ) : null}
      </Card>
    );
  }

  const showGkvRow = scenarios.some((s) => s.kpis.gkvAnteilProzent !== null);

  const rowKeys = [
    "ueberschuss",
    "revenue",
    "totalCost",
    "personalCostRatio",
    "totalEffHours",
    ...(showGkvRow ? (["gkv"] as const) : []),
  ] as const;

  const rowLabels: Record<(typeof rowKeys)[number], string> = {
    ueberschuss: "Praxisüberschuss",
    revenue: "Umsatz",
    totalCost: "Kosten",
    personalCostRatio: "Personalkostenquote",
    totalEffHours: "Effektive Stunden",
    gkv: "GKV-Anteil",
  };

  return (
    <Card variant="default" contentClassName="p-6">
      <Eyebrow>Detail</Eyebrow>
      <h3 className="mb-4 mt-3 text-xl font-bold text-brand-ink">
        Kennzahlen im Vergleich
      </h3>

      <div className="-mx-6 overflow-x-auto md:mx-0 md:overflow-visible">
        <table className="w-full min-w-[min(100%,520px)] border-collapse text-left md:min-w-0">
          <thead>
            <tr>
              <th
                className="sticky left-0 z-[1] bg-white pb-3 pr-4 max-md:bg-white md:static md:z-auto md:bg-transparent"
                aria-hidden
              />
              {scenarios.map((s) => (
                <th
                  key={s.id}
                  className="min-w-[130px] pb-3 text-right text-xs font-bold uppercase tracking-wider text-brand-muted"
                >
                  <span className="inline-block max-w-[10rem] hyphens-auto text-right leading-snug">
                    {s.name}
                    {s.isCurrent ? (
                      <span className="mt-0.5 block text-[10px] font-semibold normal-case tracking-normal text-brand-muted">
                        (Aktuell)
                      </span>
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowKeys.map((rowKey) => (
              <tr
                key={rowKey}
                className="group border-b border-[var(--color-brand-border-soft)] transition-colors hover:bg-brand-bg/40"
              >
                <td className="sticky left-0 z-[1] bg-white py-3 pr-4 text-sm font-medium text-brand-text group-hover:bg-brand-bg/40 max-md:bg-white md:static md:z-auto">
                  {rowLabels[rowKey]}
                </td>
                {scenarios.map((s) => {
                  const display = formatCell(rowKey, s.kpis);
                  const isUeberschussRow = rowKey === "ueberschuss";

                  const primary: ReactNode =
                    isUeberschussRow && s.isCurrent ? (
                      <GradientNumber
                        size="md"
                        tone={s.kpis.ueberschuss >= 0 ? "positive" : "negative"}
                      >
                        {display}
                      </GradientNumber>
                    ) : (
                      <div
                        className={`text-base tabular-nums text-brand-ink ${isUeberschussRow ? "font-bold" : ""}`}
                      >
                        {display}
                      </div>
                    );

                  const deltaEl =
                    !s.isCurrent ? renderDelta(rowKey, current.kpis, s.kpis) : null;

                  return (
                    <td
                      key={`${rowKey}-${s.id}`}
                      className="min-w-[130px] py-3 text-right align-top tabular-nums"
                    >
                      {primary}
                      {!s.isCurrent ? (
                        <div className="mt-1 flex justify-end">{deltaEl}</div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
