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

export function defaultEmployee(index: number): Employee {
  return {
    name: `Therapeut:in ${index + 1}`,
    hours: 20,
    rate: 25,
    vacation: 30,
    sick: 10,
  };
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizePraxisConfig(rawConfig: unknown): PraxisConfig {
  const raw = typeof rawConfig === "object" && rawConfig !== null ? rawConfig : {};
  const source = raw as Record<string, unknown>;

  const rawEmployees = Array.isArray(source.employees) ? source.employees : [];
  let employees: Employee[];

  if (rawEmployees.length === 0) {
    employees = [defaultEmployee(0)];
  } else {
    employees = rawEmployees.map((entry, index) => {
      const e = (entry ?? {}) as Record<string, unknown>;
      const fallback = defaultEmployee(index);
      return {
        name:
          typeof e.name === "string" && e.name.trim().length > 0
            ? e.name
            : fallback.name,
        hours: asNumber(e.hours, fallback.hours),
        rate: asNumber(e.rate, fallback.rate),
        vacation: asNumber(e.vacation, fallback.vacation),
        sick: asNumber(e.sick, fallback.sick),
      };
    });
  }

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
    gfGehaltMonat: asNumber(source.gfGehaltMonat, 0),
    inhaberEntnahmeMonat: asNumber(source.inhaberEntnahmeMonat, 0),
  };
}
