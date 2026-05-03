"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export type ScenarioComparisonChartRow = {
  id: string;
  name: string;
  ueberschuss: number;
  isCurrent?: boolean;
};

type ScenarioComparisonChartProps = {
  scenarios: ScenarioComparisonChartRow[];
  onGoToCockpit?: () => void;
};

const euro0 = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});

function formatSignedEuro(value: number): string {
  const abs = euro0.format(Math.abs(value));
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return euro0.format(0);
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ScenarioComparisonChartRow & { displayName: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-semibold tabular-nums text-brand-ink">
        {row.displayName}: {euro0.format(row.ueberschuss)} €
      </p>
    </div>
  );
}

function BarFill(row: ScenarioComparisonChartRow & { displayName: string }): string {
  if (row.ueberschuss < 0) return "#C0392B";
  if (row.isCurrent) return "var(--color-brand-ink)";
  return "var(--color-brand-primary)";
}

export function ScenarioComparisonChart({
  scenarios,
  onGoToCockpit,
}: ScenarioComparisonChartProps) {
  const hasSavedOnlyCurrent = scenarios.filter((s) => !s.isCurrent).length === 0;

  if (hasSavedOnlyCurrent) {
    return (
      <Card variant="default" contentClassName="p-6">
        <Eyebrow>Übersicht</Eyebrow>
        <h3 className="mb-2 mt-3 text-xl font-bold text-brand-ink">
          Praxisüberschuss im Vergleich
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

  const chartData = scenarios.map((row) => ({
    ...row,
    displayName: row.isCurrent ? `${row.name} (Aktuell)` : row.name,
  }));

  const height = Math.max(180, chartData.length * 60);

  return (
    <Card variant="default" contentClassName="p-6">
      <Eyebrow>Übersicht</Eyebrow>
      <h3 className="mb-1 mt-3 text-xl font-bold text-brand-ink">
        Praxisüberschuss im Vergleich
      </h3>
      <p className="mb-4 text-xs text-brand-muted">
        Gleiche Reihenfolge wie die Tabelle (Aktuell zuerst). Spalten gespeicherter Szenarien können Sie dort tauschen.
      </p>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 56, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `${euro0.format(Number(v))} €`}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              width={148}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="ueberschuss" radius={[0, 8, 8, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`${entry.id}-${index}`} fill={BarFill(entry)} />
              ))}
              <LabelList
                dataKey="ueberschuss"
                position="right"
                content={(props) => {
                  const p = props as {
                    x?: string | number;
                    y?: string | number;
                    width?: string | number;
                    height?: string | number;
                    value?: unknown;
                  };
                  const x = Number(p.x ?? 0);
                  const y = Number(p.y ?? 0);
                  const width = Number(p.width ?? 0);
                  const height = Number(p.height ?? 0);
                  const v = Number(p.value ?? 0);
                  const cx = x + width + 8;
                  const cy = y + height / 2;
                  return (
                    <text
                      x={cx}
                      y={cy}
                      dy="0.35em"
                      className="fill-brand-ink text-xs font-semibold"
                      textAnchor="start"
                    >
                      {formatSignedEuro(v)}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
