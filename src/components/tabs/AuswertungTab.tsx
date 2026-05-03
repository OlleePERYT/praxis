"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { BRAND_PIE_COLORS } from "@/lib/colors";
import type {
  Employee,
  PraxisConfig,
  PraxisResult,
  RevenueConfigMix,
} from "@/lib/engine";
import { mixChannelEuroPerHour } from "@/lib/engine";

type Slice = { name: string; value: number };

type TooltipPayloadRow = {
  name?: string;
  value?: number;
  percent?: number;
};

const euro0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const pct1 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function sumSlices(data: Slice[]): number {
  return data.reduce((s, x) => s + x.value, 0);
}

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

function LargeDonutCard({
  eyebrow,
  title,
  data,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  data: Slice[];
  emptyMessage: string;
}) {
  const totalSum = sumSlices(data);
  const hasData = data.length > 0 && totalSum > 0;

  return (
    <Card variant="default" contentClassName="p-6">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="mb-4 mt-3 text-xl font-bold text-brand-ink">{title}</h3>
      <div className="h-[320px]">
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
                innerRadius={80}
                outerRadius={140}
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
    </Card>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const x = (v: number) => v.toString(16).padStart(2, "0");
  return `#${x(r)}${x(g)}${x(b)}`;
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const u = Math.min(1, Math.max(0, t));
  return rgbToHex(
    Math.round(ar + (br - ar) * u),
    Math.round(ag + (bg - ag) * u),
    Math.round(ab + (bb - ab) * u),
  );
}

/** Ampel: 0 % grün, bei 70 % Gelb, 100 % Rot. */
function gkvGaugeColor(pct: number): string {
  const p = Math.min(100, Math.max(0, pct));
  if (p <= 70) {
    return mixHex("#22c55e", "#eab308", p / 70);
  }
  return mixHex("#eab308", "#ef4444", (p - 70) / 30);
}

function truncateLabel(name: string, max = 14): string {
  const t = name.trim();
  if (t.length <= max) return t || "—";
  return `${t.slice(0, max - 1)}…`;
}

type MixRow = { key: string; name: string; euro: number };

function MixChannelTooltip({
  active,
  payload,
  therapyTotal,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: MixRow }>;
  therapyTotal: number;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const pct = therapyTotal > 0 ? (row.euro / therapyTotal) * 100 : 0;
  return (
    <div className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {row.name}
      </p>
      <p className="text-base font-bold tabular-nums text-brand-ink">
        {euro0.format(row.euro)} €
      </p>
      <p className="text-xs font-semibold text-brand-primary tabular-nums">
        {pct1.format(pct)} % vom Therapie-Umsatz
      </p>
    </div>
  );
}

export type AuswertungTabProps = {
  config: PraxisConfig;
  result: PraxisResult;
};

export function AuswertungTab({ config, result }: AuswertungTabProps) {
  const isMix = config.revenue.mode === "mix";

  const costSlices = useMemo(() => {
    const slices: Slice[] = [];
    result.employeeDetails.forEach((d, i) => {
      slices.push({
        name: d.name || `Therapeut:in ${i + 1}`,
        value: d.cost,
      });
    });
    slices.push({
      name: "Miete + Sachkosten",
      value: result.totalSach,
    });
    return slices.filter((x) => x.value > 0);
  }, [result]);

  const revSlices = useMemo(() => {
    const therapyTotal = result.revenueTherapy;
    const totalEff = result.employeeDetails.reduce((s, e) => s + e.effHours, 0);
    const slices: Slice[] = [];
    if (therapyTotal > 0 && totalEff > 0) {
      result.employeeDetails.forEach((d, i) => {
        const share = therapyTotal * (d.effHours / totalEff);
        if (share > 0) {
          slices.push({
            name: d.name || `Therapeut:in ${i + 1}`,
            value: share,
          });
        }
      });
    }
    return slices;
  }, [result]);

  const mixRows = useMemo((): MixRow[] => {
    if (!isMix) return [];
    const rev = config.revenue as RevenueConfigMix;
    const parts = mixChannelEuroPerHour(rev);
    const therapyTotal = result.revenueTherapy;
    if (therapyTotal <= 0 || parts.effective <= 0) return [];
    const channels: { key: string; name: string; part: number }[] = [
      { key: "gkv", name: "GKV", part: parts.gkv },
      { key: "pkv", name: "PKV", part: parts.pkv },
      { key: "bg", name: "BG", part: parts.bg },
      { key: "self", name: "Selbstzahler", part: parts.self },
    ];
    return channels.map((c) => ({
      key: c.key,
      name: c.name,
      euro: therapyTotal * (c.part / parts.effective),
    }));
  }, [config.revenue, isMix, result.revenueTherapy]);

  const totalEff = useMemo(
    () => result.employeeDetails.reduce((s, e) => s + e.effHours, 0),
    [result.employeeDetails],
  );

  const personnelBars = useMemo(() => {
    return config.employees
      .map((e: Employee, i: number) => ({ e, i }))
      .filter(({ e }) => e.hours > 0)
      .map(({ e, i }) => {
        const d = result.employeeDetails[i];
        if (!d) return null;
        const personnelCost = d.cost + d.trainingCost;
        const maRevShare =
          totalEff > 0 ? result.revenueTherapy * (d.effHours / totalEff) : 0;
        const maDb = maRevShare - d.cost - d.trainingCost;
        return {
          key: `ma-${i}`,
          shortName: truncateLabel(e.name.trim() || `MA ${i + 1}`, 14),
          personnelCost,
          db: maDb,
          colorIdx: i,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [config.employees, result, totalEff]);

  const hourStacks = useMemo(() => {
    return config.employees
      .map((e: Employee, i: number) => ({ e, i }))
      .filter(({ e }) => e.hours > 0)
      .map(({ e, i }) => {
        const d = result.employeeDetails[i];
        if (!d) return null;
        const vacation = e.hours * (e.vacation / 5);
        const sick = e.hours * (e.sick / 5);
        const training = e.hours * (e.training / 5);
        return {
          key: `h-${i}`,
          name: truncateLabel(e.name.trim() || `MA ${i + 1}`, 14),
          eff: d.effHours,
          urlaub: vacation,
          krank: sick,
          wb: training,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [config.employees, result.employeeDetails]);

  const gkvPct =
    isMix ? Math.min(100, Math.max(0, (config.revenue as RevenueConfigMix).gkvPct)) : 0;

  const gaugeFill = gkvGaugeColor(gkvPct);
  const radialData = [{ name: "gkv", value: gkvPct, fill: gaugeFill }];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <LargeDonutCard
        eyebrow="Kosten"
        title="Kostenverteilung"
        data={costSlices}
        emptyMessage="Keine Kostenposten mit positivem Betrag."
      />
      <LargeDonutCard
        eyebrow="Erlöse"
        title="Therapie-Erlöse je Mitarbeiter:in"
        data={revSlices}
        emptyMessage="Keine Therapie-Erlöse (keine effektiven Stunden)."
      />

      {isMix ? (
        <Card variant="default" contentClassName="p-6">
          <Eyebrow>Erlös-Mix</Eyebrow>
          <h3 className="mb-4 mt-3 text-xl font-bold text-brand-ink">
            Kanäle am Therapie-Umsatz
          </h3>
          <div className="h-[280px]">
            {mixRows.length === 0 ? (
              <p className="flex h-full items-center justify-center text-center text-sm text-brand-muted">
                Keine Daten für den Erlös-Mix.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mixRows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${euro0.format(Number(v))} €`}
                    width={72}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    content={
                      <MixChannelTooltip therapyTotal={result.revenueTherapy} />
                    }
                  />
                  <Bar dataKey="euro" radius={[6, 6, 0, 0]}>
                    {mixRows.map((row, index) => (
                      <Cell
                        key={row.key}
                        fill={BRAND_PIE_COLORS[index % BRAND_PIE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      ) : (
        <Card variant="default" contentClassName="p-6">
          <Eyebrow>Erlös-Mix</Eyebrow>
          <h3 className="mb-2 mt-3 text-xl font-bold text-brand-ink">
            Nur im Mix-Modus
          </h3>
          <p className="text-sm leading-relaxed text-brand-text">
            Die Aufteilung nach GKV, PKV, BG und Selbstzahler ist im Erlös-Modell
            „Mix“ verfügbar. Wechseln Sie im Cockpit unter Erlöse auf Mix, um diese
            Grafik zu sehen.
          </p>
        </Card>
      )}

      <Card variant="default" contentClassName="p-6">
        <Eyebrow>GKV-Risiko</Eyebrow>
        <h3 className="mb-2 mt-3 text-xl font-bold text-brand-ink">
          GKV-Anteil am Therapie-Umsatz
        </h3>
        {isMix ? (
          <>
            <div className="relative mx-auto h-[280px] max-w-md">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="92%"
                  innerRadius="52%"
                  outerRadius="92%"
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar
                    background={{ fill: "rgba(232,228,217,0.9)" }}
                    dataKey="value"
                    cornerRadius={8}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10 pt-6">
                <p className="text-4xl font-bold tabular-nums text-brand-ink">
                  {pct1.format(gkvPct)} %
                </p>
                <p className="mt-1 max-w-[12rem] text-center text-xs text-brand-muted">
                  GKV-Anteil am Therapie-Umsatz
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-brand-text">
            Die GKV-Visualisierung bezieht sich auf den Mix-Modus. Bitte aktivieren
            Sie unter Erlöse den Modus „Mix“, um den Anteil zu bewerten.
          </p>
        )}
      </Card>

      <Card variant="default" contentClassName="p-6">
        <Eyebrow>Personal</Eyebrow>
        <h3 className="mb-4 mt-3 text-xl font-bold text-brand-ink">
          Personalkosten je Mitarbeiter:in (Jahr)
        </h3>
        <div className="h-[280px]">
          {personnelBars.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-brand-muted">
              Keine aktiven Mitarbeiter:innen.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={personnelBars}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11 }} interval={0} />
                <YAxis
                  tickFormatter={(v) => `${euro0.format(Number(v))}`}
                  width={56}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const v = Number(payload[0]?.value ?? 0);
                    return (
                      <div className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-2 shadow-lg">
                        <p className="text-sm font-semibold tabular-nums text-brand-ink">
                          {euro0.format(v)} €
                        </p>
                        <p className="text-xs text-brand-muted">Personalkosten</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="personnelCost" radius={[6, 6, 0, 0]}>
                  {personnelBars.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={
                        BRAND_PIE_COLORS[index % BRAND_PIE_COLORS.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card variant="default" contentClassName="p-6">
        <Eyebrow>Deckungsbeitrag</Eyebrow>
        <h3 className="mb-4 mt-3 text-xl font-bold text-brand-ink">
          Deckungsbeitrag je Mitarbeiter:in (Jahr)
        </h3>
        <div className="h-[280px]">
          {personnelBars.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-brand-muted">
              Keine aktiven Mitarbeiter:innen.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={personnelBars}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11 }} interval={0} />
                <YAxis
                  tickFormatter={(v) => `${euro0.format(Number(v))}`}
                  width={56}
                  tick={{ fontSize: 11 }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const v = Number(payload[0]?.value ?? 0);
                    return (
                      <div className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-2 shadow-lg">
                        <p className="text-sm font-semibold tabular-nums text-brand-ink">
                          {euro0.format(v)} €
                        </p>
                        <p className="text-xs text-brand-muted">Deckungsbeitrag</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="db" radius={[6, 6, 0, 0]}>
                  {personnelBars.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.db >= 0 ? "var(--c-primary)" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Card variant="default" contentClassName="p-6">
          <Eyebrow>Zeitbudget</Eyebrow>
          <h3 className="mb-4 mt-3 text-xl font-bold text-brand-ink">
            Personalstunden je Mitarbeiter:in — wo geht die Zeit hin?
          </h3>
          <div className="min-h-[280px] h-[360px]">
            {hourStacks.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-brand-muted">
                Keine aktiven Mitarbeiter:innen.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={hourStacks}
                  margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={96}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0]?.payload as (typeof hourStacks)[0];
                      return (
                        <div className="rounded-lg border border-[var(--color-brand-border-soft)] bg-white px-3 py-2 shadow-lg">
                          <p className="text-xs font-semibold text-brand-muted">
                            {row?.name ?? ""}
                          </p>
                          {payload.map((p) => (
                            <p
                              key={String(p.dataKey)}
                              className="text-sm tabular-nums text-brand-ink"
                            >
                              {String(p.name ?? p.dataKey)}:{" "}
                              {pct1.format(Number(p.value))} Std.
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar
                    stackId="stunden"
                    dataKey="eff"
                    fill="#52B788"
                    name="Effektiv-Stunden"
                  />
                  <Bar
                    stackId="stunden"
                    dataKey="urlaub"
                    fill="#7A8B4D"
                    name="Urlaub"
                  />
                  <Bar
                    stackId="stunden"
                    dataKey="krank"
                    fill="#f87171"
                    name="Krankheit"
                  />
                  <Bar
                    stackId="stunden"
                    dataKey="wb"
                    fill="#facc15"
                    name="Weiterbildung"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#52B788]" /> Effektiv
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#7A8B4D]" /> Urlaub
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#f87171]" /> Krankheit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#facc15]" /> Weiterbildung
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
