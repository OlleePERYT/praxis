"use client";

import { C } from "@/lib/colors";
import type { PraxisResult } from "@/lib/engine";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmt = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

type ComparisonTableProps = {
  result: PraxisResult;
  refRevenue: number;
  refCosts: number;
  refSurplus: number;
  refLabel: string;
};

export function ComparisonTable({
  result,
  refRevenue,
  refCosts,
  refSurplus,
  refLabel,
}: ComparisonTableProps) {
  if (refRevenue === 0) {
    return null;
  }

  const rows = [
    {
      key: "Umsatz",
      ref: refRevenue,
      plan: result.revenue,
    },
    {
      key: "Kosten",
      ref: refCosts,
      plan: result.totalCost,
    },
    {
      key: "Überschuss",
      ref: refSurplus,
      plan: result.ueberschuss,
    },
  ];

  const chartData = rows.map((r) => ({
    name: r.key,
    referenz: r.ref,
    planung: r.plan,
  }));

  return (
    <section
      className="space-y-4 rounded-xl border p-4 shadow-sm"
      style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
    >
      <h2 className="text-xl font-semibold" style={{ color: C.primary }}>
        Referenzvergleich
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-sm">
            <thead>
              <tr style={{ color: C.gray }}>
                <th className="p-2 text-left" />
                <th className="p-2 text-right">{refLabel}</th>
                <th className="p-2 text-right">Simulation</th>
                <th className="p-2 text-right">Differenz</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} style={{ borderTop: `1px solid ${C.lightBg2}` }}>
                  <td className="p-2 font-medium" style={{ color: C.primary }}>
                    {r.key}
                  </td>
                  <td className="p-2 text-right tabular-nums">{fmt.format(r.ref)} €</td>
                  <td className="p-2 text-right tabular-nums">{fmt.format(r.plan)} €</td>
                  <td
                    className="p-2 text-right font-medium tabular-nums"
                    style={{ color: r.plan - r.ref >= 0 ? C.green : C.red }}
                  >
                    {fmt.format(r.plan - r.ref)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.lightBg2} />
              <XAxis dataKey="name" tick={{ fill: C.gray, fontSize: 12 }} />
              <YAxis tick={{ fill: C.gray, fontSize: 12 }} />
              <Tooltip
                formatter={(v) => [`${fmt.format(Number(v ?? 0))} €`, ""]}
                contentStyle={{ borderColor: C.lightBg2 }}
              />
              <Legend />
              <Bar dataKey="referenz" name={refLabel} fill={C.accent} />
              <Bar dataKey="planung" name="Simulation" fill={C.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
