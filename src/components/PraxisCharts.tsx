"use client";

import { BRAND_PIE_COLORS } from "@/lib/colors";
import type { PraxisResult } from "@/lib/engine";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Card from "./ui/Card";

type Slice = { name: string; value: number };

type PraxisChartsProps = {
  result: PraxisResult;
};

const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

function sumSlices(data: Slice[]): number {
  return data.reduce((s, x) => s + x.value, 0);
}

type TooltipPayloadRow = {
  name?: string;
  value?: number;
  percent?: number;
};

function PieTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipPayloadRow>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const name = String(row.name ?? "");
  const value = Number(row.value ?? 0);
  const pctDisplay =
    typeof row.percent === "number"
      ? row.percent * 100
      : total > 0
        ? (value / total) * 100
        : null;

  return (
    <div className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {name}
      </p>
      <p className="text-base font-bold tabular-nums text-brand-ink">
        {euro0.format(value)} €
      </p>
      {pctDisplay !== null ? (
        <p className="text-xs font-semibold text-brand-primary tabular-nums">
          {pctDisplay.toFixed(1)} %
        </p>
      ) : null}
    </div>
  );
}

function PieLegend({ data }: { data: Slice[] }) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-3">
      {data.map((entry, index) => (
        <div key={`${entry.name}-${index}`} className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 shrink-0 rounded-sm"
            style={{
              backgroundColor: BRAND_PIE_COLORS[index % BRAND_PIE_COLORS.length],
            }}
          />
          <span className="text-xs text-brand-text">{entry.name}</span>
        </div>
      ))}
    </div>
  );
}

function PieBlock({
  eyebrow,
  description,
  data,
  emptyMessage,
}: {
  eyebrow: string;
  description?: string;
  data: Slice[];
  emptyMessage: string;
}) {
  const totalSum = sumSlices(data);
  const hasData = data.length > 0 && totalSum > 0;

  return (
    <div className="rounded-2xl bg-brand-bg/40 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {eyebrow}
      </p>
      {description ? (
        <p className="mb-3 text-xs text-brand-muted">{description}</p>
      ) : (
        <div className="mb-3" />
      )}
      <div style={{ height: 280 }}>
        {!hasData ? (
          <p className="flex h-full items-center justify-center text-center text-sm text-brand-muted">
            {emptyMessage}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={BRAND_PIE_COLORS[i % BRAND_PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={(props) => (
                  <PieTooltip
                    active={props.active}
                    payload={
                      props.payload as ReadonlyArray<TooltipPayloadRow> | undefined
                    }
                    total={totalSum}
                  />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {hasData ? <PieLegend data={data} /> : null}
    </div>
  );
}

export function PraxisCharts({ result }: PraxisChartsProps) {
  const costSlices: Slice[] = [];
  result.employeeDetails.forEach((d, i) => {
    costSlices.push({
      name: d.name || `Therapeut:in ${i + 1}`,
      value: d.cost,
    });
  });
  costSlices.push({
    name: "Miete + Sachkosten",
    value: result.totalSach,
  });
  const costData = costSlices.filter((x) => x.value > 0);

  const therapyTotal = result.revenueTherapy;
  const totalEff = result.employeeDetails.reduce((s, e) => s + e.effHours, 0);

  const revSlices: Slice[] = [];
  if (therapyTotal > 0 && totalEff > 0) {
    result.employeeDetails.forEach((d, i) => {
      const share = therapyTotal * (d.effHours / totalEff);
      if (share > 0) {
        revSlices.push({
          name: d.name || `Therapeut:in ${i + 1}`,
          value: share,
        });
      }
    });
  }

  return (
    <Card variant="default" contentClassName="p-6">
      <h3 className="mb-4 text-xl font-bold text-brand-ink">
        Kosten und Erlöse im Überblick
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PieBlock
          eyebrow="Kostenverteilung"
          description="Personal je Mitarbeiter:in; übrige Position = Miete + Sachkosten."
          data={costData}
          emptyMessage="Keine Kostenposten mit positivem Betrag."
        />
        <PieBlock
          eyebrow="Erlöse nach Mitarbeiter:in"
          description="Anteilig nach effektiven Stunden (ohne Untermiete)."
          data={revSlices}
          emptyMessage="Keine Therapie-Erlöse (keine effektiven Stunden)."
        />
      </div>
    </Card>
  );
}
