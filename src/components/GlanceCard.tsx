"use client";

import { C } from "@/lib/colors";
import type { PraxisResult } from "@/lib/engine";

const fmt = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

type GlanceCardProps = {
  result: PraxisResult;
};

function line(label: string, year: number, month: number) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b py-2 last:border-b-0" style={{ borderColor: C.lightBg2 }}>
      <span style={{ color: C.gray }}>{label}</span>
      <span className="text-right font-medium tabular-nums" style={{ color: C.primary }}>
        {fmt.format(year)} € / Jahr · {fmt.format(month)} € / Monat
      </span>
    </div>
  );
}

export function GlanceCard({ result }: GlanceCardProps) {
  const incY = result.totalIncome;
  const costY = result.totalCost;
  const surY = result.ueberschuss;

  return (
    <section
      className="sticky top-14 z-40 rounded-xl border border-opacity-80 bg-white/95 p-4 shadow-sm backdrop-blur"
      style={{ borderColor: C.lightBg2 }}
    >
      <h2 className="mb-3 text-lg font-semibold" style={{ color: C.primary }}>
        Auf einen Blick
      </h2>
      <div className="space-y-1 text-sm">
        {line("Einnahmen", incY, incY / 12)}
        {line("Kosten", costY, costY / 12)}
        {line("Überschuss", surY, surY / 12)}
      </div>
    </section>
  );
}
