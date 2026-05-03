"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
  revenueDetails: {
    revenueTherapy: number;
    untermieteJahr: number;
    handelswareJahr: number;
  };
  costDetails: {
    personalCost: number;
    sachkostenJahr: number;
    mieteJahr: number;
    trainingCostTotal: number;
  };
  personalDetails: Array<{
    name: string;
    cost: number;
    effHours: number;
    db: number;
  }>;
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

function gfGehaltFromKpis(k: ScenarioComparisonTableKpis): number {
  const sumMa = k.personalDetails.reduce((a, p) => a + p.cost, 0);
  return Math.max(0, k.costDetails.personalCost - sumMa);
}

function personalCostByName(
  kpis: ScenarioComparisonTableKpis,
  name: string,
): number | null {
  const row = kpis.personalDetails.find((p) => p.name === name);
  return row ? row.cost : null;
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-brand-muted transition-transform duration-200 ease-out ${expanded ? "rotate-90" : ""}`}
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
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

function DeltaEuroOptional({
  currentVal,
  val,
  inverted,
}: {
  currentVal: number | null;
  val: number | null;
  inverted?: boolean;
}) {
  if (currentVal === null || val === null) {
    return <span className="text-xs text-brand-muted">—</span>;
  }
  return <DeltaEuro currentVal={currentVal} val={val} inverted={inverted} />;
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
    case "personalAgg":
      return (
        <DeltaEuro
          currentVal={ck.costDetails.personalCost}
          val={vk.costDetails.personalCost}
          inverted
        />
      );
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
    case "personalAgg":
      return formatEuro(kpis.costDetails.personalCost);
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

const subFirstCol =
  "sticky left-0 z-[1] border-l-2 border-brand-primary/15 bg-brand-bg/30 py-2 pr-4 pl-8 max-md:pl-4 md:bg-brand-bg/30";
const subTr = "bg-brand-bg/30 transition-colors duration-200 ease-out";

export function ScenarioComparisonTable({
  scenarios,
  onGoToCockpit,
}: ScenarioComparisonTableProps) {
  const current = scenarios.find((s) => s.isCurrent);
  const onlyCurrent = scenarios.length <= 1;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());

  const toggleExpanded = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const maNamesSorted = useMemo(() => {
    const names = new Set<string>();
    for (const s of scenarios) {
      for (const p of s.kpis.personalDetails) {
        names.add(p.name);
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b, "de"));
  }, [scenarios]);

  const showUntermiete = scenarios.some((s) => s.kpis.revenueDetails.untermieteJahr > 0);
  const showHandelsware = scenarios.some((s) => s.kpis.revenueDetails.handelswareJahr > 0);
  const showTraining = scenarios.some((s) => s.kpis.costDetails.trainingCostTotal > 0);
  const showGF = scenarios.some((s) => gfGehaltFromKpis(s.kpis) > 0.01);

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

  const baselineRow = current;

  const showGkvRow = scenarios.some((s) => s.kpis.gkvAnteilProzent !== null);

  const expandableHeaderTd =
    "sticky left-0 z-[1] cursor-pointer bg-white py-3 pr-4 hover:bg-brand-bg/50 group-hover:bg-brand-bg/50 max-md:bg-white md:static md:z-auto md:bg-transparent md:hover:bg-brand-bg/50";

  function renderPrimaryCell(rowKey: string, s: ScenarioComparisonTableRow): ReactNode {
    const display = formatCell(rowKey, s.kpis);
    const isUeberschussRow = rowKey === "ueberschuss";

    if (isUeberschussRow && s.isCurrent) {
      return (
        <GradientNumber
          size="md"
          tone={s.kpis.ueberschuss >= 0 ? "positive" : "negative"}
        >
          {display}
        </GradientNumber>
      );
    }

    return (
      <div
        className={`text-base tabular-nums text-brand-ink ${isUeberschussRow ? "font-bold" : ""}`}
      >
        {display}
      </div>
    );
  }

  function renderSimpleRow(rowKey: string, label: string) {
    return (
      <tr
        key={rowKey}
        className="group border-b border-[var(--color-brand-border-soft)] transition-colors hover:bg-brand-bg/40"
      >
        <td
          className={`sticky left-0 z-[1] bg-white py-3 pr-4 text-sm font-medium text-brand-text group-hover:bg-brand-bg/40 max-md:bg-white md:static md:z-auto`}
        >
          {label}
        </td>
        {scenarios.map((s) => (
          <td
            key={`${rowKey}-${s.id}`}
            className="min-w-[130px] py-3 text-right align-top tabular-nums"
          >
            {renderPrimaryCell(rowKey, s)}
            {!s.isCurrent ? (
              <div className="mt-1 flex justify-end">{renderDelta(rowKey, baselineRow.kpis, s.kpis)}</div>
            ) : null}
          </td>
        ))}
      </tr>
    );
  }

  function renderExpandableHeader(
    expandKey: string,
    label: string,
    rowKey: string,
  ) {
    const expanded = expandedRows.has(expandKey);
    return (
      <tr
        key={`hdr-${expandKey}`}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => toggleExpanded(expandKey)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpanded(expandKey);
          }
        }}
        className="group cursor-pointer border-b border-[var(--color-brand-border-soft)] hover:bg-brand-bg/50"
      >
        <td className={expandableHeaderTd}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-text">
            <Chevron expanded={expanded} />
            {label}
          </span>
        </td>
        {scenarios.map((s) => (
          <td
            key={`${expandKey}-${rowKey}-${s.id}`}
            className="min-w-[130px] py-3 text-right align-top tabular-nums"
          >
            {renderPrimaryCell(rowKey, s)}
            {!s.isCurrent ? (
              <div className="mt-1 flex justify-end">{renderDelta(rowKey, baselineRow.kpis, s.kpis)}</div>
            ) : null}
          </td>
        ))}
      </tr>
    );
  }

  function renderSubEuroRow(
    subKey: string,
    label: string,
    getVal: (k: ScenarioComparisonTableKpis) => number | null,
    inverted?: boolean,
    emphasize?: boolean,
  ) {
    return (
      <tr key={subKey} className={`${subTr} border-b border-[var(--color-brand-border-soft)]`}>
        <td className={subFirstCol}>
          <span className={emphasize ? "font-semibold text-brand-text" : ""}>{label}</span>
        </td>
        {scenarios.map((s) => {
          const v = getVal(s.kpis);
          const cv = getVal(baselineRow.kpis);
          return (
            <td
              key={`${subKey}-${s.id}`}
              className="min-w-[130px] bg-brand-bg/30 py-2 text-right align-top tabular-nums"
            >
              <span
                className={`text-sm tabular-nums text-brand-text ${emphasize ? "font-semibold" : ""}`}
              >
                {v === null ? "—" : formatEuro(v)}
              </span>
              {!s.isCurrent ? (
                <div className="mt-1 flex justify-end">
                  <DeltaEuroOptional currentVal={cv} val={v} inverted={inverted} />
                </div>
              ) : null}
            </td>
          );
        })}
      </tr>
    );
  }

  const revenueSubsExpanded = expandedRows.has("umsatz");
  const personalSubsExpanded = expandedRows.has("personal");
  const kostenSubsExpanded = expandedRows.has("kosten");

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
            {renderSimpleRow("ueberschuss", "Praxisüberschuss")}
            {renderExpandableHeader("umsatz", "Umsatz", "revenue")}
            {revenueSubsExpanded ? (
              <>
                {renderSubEuroRow(
                  "sub-therapy",
                  "Therapie-Erlöse",
                  (k) => k.revenueDetails.revenueTherapy,
                  false,
                )}
                {showUntermiete
                  ? renderSubEuroRow(
                      "sub-untermiete",
                      "Untermiete (Jahr)",
                      (k) => k.revenueDetails.untermieteJahr,
                      false,
                    )
                  : null}
                {showHandelsware
                  ? renderSubEuroRow(
                      "sub-handel",
                      "Handelsware (Jahr)",
                      (k) => k.revenueDetails.handelswareJahr,
                      false,
                    )
                  : null}
              </>
            ) : null}

            {renderExpandableHeader("personal", "Personal", "personalAgg")}
            {personalSubsExpanded ? (
              <>
                {maNamesSorted.map((maName) =>
                  renderSubEuroRow(
                    `sub-ma-${maName}`,
                    maName,
                    (k) => personalCostByName(k, maName),
                    true,
                  ),
                )}
                {showGF
                  ? renderSubEuroRow("sub-gf", "GF-Gehalt", (k) => gfGehaltFromKpis(k), true)
                  : null}
                {renderSubEuroRow(
                  "sub-personal-sum",
                  "Personalkosten gesamt",
                  (k) => k.costDetails.personalCost,
                  true,
                  true,
                )}
              </>
            ) : null}

            {renderSimpleRow("personalCostRatio", "Personalkostenquote")}
            {renderSimpleRow("totalEffHours", "Effektive Stunden")}
            {renderExpandableHeader("kosten", "Kosten", "totalCost")}
            {kostenSubsExpanded ? (
              <>
                {renderSubEuroRow(
                  "sub-k-pers",
                  "Personalkosten gesamt",
                  (k) => k.costDetails.personalCost,
                  true,
                )}
                {renderSubEuroRow(
                  "sub-k-sach",
                  "Sachkosten",
                  (k) => k.costDetails.sachkostenJahr,
                  true,
                )}
                {renderSubEuroRow(
                  "sub-k-miete",
                  "Miete (Jahr)",
                  (k) => k.costDetails.mieteJahr,
                  true,
                )}
                {showTraining
                  ? renderSubEuroRow(
                      "sub-k-wb",
                      "Weiterbildungskosten gesamt",
                      (k) => k.costDetails.trainingCostTotal,
                      true,
                    )
                  : null}
              </>
            ) : null}

            {showGkvRow ? renderSimpleRow("gkv", "GKV-Anteil") : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
