"use client";

import { C } from "@/lib/colors";
import type { PraxisResult } from "@/lib/engine";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PIE_COLORS = [
  C.primary,
  C.accent,
  C.green,
  C.orange,
  C.lightGray,
  "#5a8f8f",
  "#8fbc8f",
];

type PraxisChartsProps = {
  result: PraxisResult;
};

export function PraxisCharts({ result }: PraxisChartsProps) {
  const costSlices: { name: string; value: number }[] = [];
  result.employeeDetails.forEach((d, i) => {
    costSlices.push({
      name: d.name || `MA ${i + 1}`,
      value: d.cost,
    });
  });
  costSlices.push({
    name: "Miete, Sach, Untermiete (netto)",
    value: result.totalSach,
  });
  const costData = costSlices.filter((x) => x.value > 0);

  const therapyTotal = result.revenueTherapy;
  const totalEff = result.employeeDetails.reduce((s, e) => s + e.effHours, 0);

  const revSlices: { name: string; value: number }[] = [];
  if (therapyTotal > 0 && totalEff > 0) {
    result.employeeDetails.forEach((d, i) => {
      const share = therapyTotal * (d.effHours / totalEff);
      if (share > 0) {
        revSlices.push({
          name: d.name || `MA ${i + 1}`,
          value: share,
        });
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section
        className="rounded-xl border p-4 shadow-sm"
        style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
      >
        <h3 className="mb-2 text-base font-semibold" style={{ color: C.primary }}>
          Kostenverteilung
        </h3>
        <p className="mb-2 text-xs" style={{ color: C.lightGray }}>
          Personal je Mitarbeiter; übrige Position = Miete + Sachkosten − Untermiete (BWA-konform).
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${String(name).split(" ")[0]}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {costData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${Math.round(Number(v ?? 0))} €`, ""]}
                contentStyle={{ borderColor: C.lightBg2 }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section
        className="rounded-xl border p-4 shadow-sm"
        style={{ backgroundColor: C.white, borderColor: C.lightBg2 }}
      >
        <h3 className="mb-2 text-base font-semibold" style={{ color: C.primary }}>
          Therapie-Erlös je Teammitglied
        </h3>
        <p className="mb-2 text-xs" style={{ color: C.lightGray }}>
          Anteilig nach effektiven Stunden (ohne Untermiete).
        </p>
        <div className="h-64">
          {revSlices.length === 0 ? (
            <p className="py-12 text-center text-sm" style={{ color: C.lightGray }}>
              Keine Therapie-Erlöse (keine effektiven Stunden).
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revSlices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {revSlices.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${Math.round(Number(v ?? 0))} €`, ""]}
                  contentStyle={{ borderColor: C.lightBg2 }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
