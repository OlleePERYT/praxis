import type {
  Employee,
  PraxisConfig,
  RevenueConfigDirect,
  RevenueConfigMix,
} from "@/lib/engine";

const defaultRevenue: RevenueConfigDirect = {
  mode: "direct",
  revPerHour: 75,
};

/** Fünf feste Slots – generische Defaults (Onboarding überschreibt via DB-JSON). */
export const DEFAULT_EMPLOYEES: Employee[] = [
  { name: "Therapeut:in 1", hours: 20, rate: 28, vacation: 30, sick: 10 },
  { name: "Therapeut:in 2", hours: 0, rate: 25, vacation: 30, sick: 10 },
  { name: "Therapeut:in 3", hours: 0, rate: 25, vacation: 30, sick: 10 },
  { name: "Therapeut:in 4", hours: 0, rate: 25, vacation: 30, sick: 10 },
  { name: "Therapeut:in 5", hours: 0, rate: 25, vacation: 30, sick: 10 },
];

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizePraxisConfig(rawConfig: unknown): PraxisConfig {
  const raw = typeof rawConfig === "object" && rawConfig !== null ? rawConfig : {};
  const source = raw as Record<string, unknown>;

  const rawEmployees = Array.isArray(source.employees) ? source.employees : [];
  const employees: Employee[] = DEFAULT_EMPLOYEES.map((defaults, index) => {
    const entry = (rawEmployees[index] ?? {}) as Record<string, unknown>;
    return {
      name:
        typeof entry.name === "string" && entry.name.trim().length > 0
          ? entry.name
          : defaults.name,
      hours: asNumber(entry.hours, defaults.hours),
      rate: asNumber(entry.rate, defaults.rate),
      vacation: asNumber(entry.vacation, defaults.vacation),
      sick: asNumber(entry.sick, defaults.sick),
    };
  });

  const revenueNode =
    typeof source.revenue === "object" && source.revenue !== null
      ? (source.revenue as Record<string, unknown>)
      : null;

  let revenue: RevenueConfigDirect | RevenueConfigMix;
  if (revenueNode?.mode === "mix" || source.revenueMode === "mix") {
    revenue = {
      mode: "mix",
      gkvPct: asNumber(revenueNode?.gkvPct ?? source.gkvPct, 70),
      pkvPct: asNumber(revenueNode?.pkvPct ?? source.pkvPct, 30),
      gkvPerTreatment: asNumber(revenueNode?.gkvPerTreatment ?? source.gkvPerTreatment, 35),
      pkvPerTreatment: asNumber(revenueNode?.pkvPerTreatment ?? source.pkvPerTreatment, 49),
      selfPerTreatment: asNumber(
        revenueNode?.selfPerTreatment ?? source.selfPerTreatment,
        45,
      ),
      treatmentsPerHour: asNumber(
        revenueNode?.treatmentsPerHour ?? source.treatmentsPerHour,
        2,
      ),
      utilization: asNumber(revenueNode?.utilization ?? source.utilization, 75),
    };
  } else {
    revenue = {
      mode: "direct",
      revPerHour: asNumber(revenueNode?.revPerHour ?? source.revPerHour, defaultRevenue.revPerHour),
    };
  }

  return {
    employees,
    revenue,
    mieteMonat: asNumber(source.mieteMonat, 1200),
    untermiete: asNumber(source.untermiete, 0),
    sachkosten: asNumber(source.sachkosten, 24020),
    refRevenue: asNumber(source.refRevenue, 0),
    refCosts: asNumber(source.refCosts, 0),
    refSurplus: asNumber(source.refSurplus, 0),
    refLabel: typeof source.refLabel === "string" && source.refLabel.trim().length > 0
      ? source.refLabel
      : "Bisher",
  };
}
