const AG = 1.21;
const WEEKS = 52;
const SACH_OHNE_MIETE = 24020;

export interface Employee {
  name: string;
  hours: number;
  rate: number;
  vacation: number;
  sick: number;
}

export interface RevenueConfigDirect {
  mode: "direct";
  revPerHour: number;
}

export interface RevenueConfigMix {
  mode: "mix";
  gkvPct: number;
  pkvPct: number;
  gkvPerTreatment: number;
  pkvPerTreatment: number;
  selfPerTreatment: number;
  treatmentsPerHour: number;
  utilization: number;
}

export interface PraxisConfig {
  employees: Employee[];
  revenue: RevenueConfigDirect | RevenueConfigMix;
  mieteMonat: number;
  untermiete: number;
  sachkosten: number;
  refRevenue: number;
  refCosts: number;
  refSurplus: number;
  refLabel: string;
}

export interface PraxisResult {
  totalCost: number;
  personalCost: number;
  mieteJahr: number;
  sachkostenJahr: number;
  untermieteJahr: number;
  totalSach: number;
  /** Jahresumsatz (Therapie + Untermiete); identisch zu totalIncome */
  revenue: number;
  totalIncome: number;
  revenueTherapy: number;
  ueberschuss: number;
  personalCostRatio: number;
  employeeDetails: {
    name: string;
    effWeeks: number;
    effHours: number;
    cost: number;
  }[];
}

export function getEffectiveRevPerHour(
  revenue: RevenueConfigDirect | RevenueConfigMix,
): number {
  if (revenue.mode === "direct") {
    return revenue.revPerHour;
  }
  const selfPct = Math.max(0, 100 - revenue.gkvPct - revenue.pkvPct);
  const avgPerTreatment =
    (revenue.gkvPct * revenue.gkvPerTreatment +
      revenue.pkvPct * revenue.pkvPerTreatment +
      selfPct * revenue.selfPerTreatment) /
    100;
  return (
    avgPerTreatment * revenue.treatmentsPerHour * (revenue.utilization / 100)
  );
}

/** Anteil am effektiven Erlös/Stunde je Versicherungskanal (Summe = effektiver €/h). */
export function mixChannelEuroPerHour(config: RevenueConfigMix): {
  effective: number;
  selfPct: number;
  gkv: number;
  pkv: number;
  self: number;
} {
  const selfPct = Math.max(0, 100 - config.gkvPct - config.pkvPct);
  const u = config.utilization / 100;
  const tph = config.treatmentsPerHour;
  const gkv =
    (config.gkvPct / 100) * config.gkvPerTreatment * tph * u;
  const pkv =
    (config.pkvPct / 100) * config.pkvPerTreatment * tph * u;
  const self =
    (selfPct / 100) * config.selfPerTreatment * tph * u;
  return { effective: gkv + pkv + self, selfPct, gkv, pkv, self };
}

export function calculatePraxis(config: PraxisConfig): PraxisResult {
  const employeeDetails = config.employees.map((employee) => {
    const offWeeks = (employee.vacation + employee.sick) / 5;
    const effWeeks = WEEKS - offWeeks;
    const effHours = employee.hours * effWeeks;
    const cost = employee.rate * employee.hours * WEEKS * AG;

    return {
      name: employee.name,
      effWeeks,
      effHours,
      cost,
    };
  });

  const effectiveRevPerHour = getEffectiveRevPerHour(config.revenue);

  const totalEffHours = employeeDetails.reduce(
    (sum, employee) => sum + employee.effHours,
    0,
  );
  const revenueTherapy = totalEffHours * effectiveRevPerHour;
  const untermieteJahr = config.untermiete * 12;
  const revenue = revenueTherapy + untermieteJahr;
  const totalIncome = revenue;

  const personalCost = employeeDetails.reduce(
    (sum, employee) => sum + employee.cost,
    0,
  );
  const mieteJahr = config.mieteMonat * 12;
  const sachkostenJahr = config.sachkosten ?? SACH_OHNE_MIETE;
  const totalSach = sachkostenJahr + mieteJahr;
  const totalCost = personalCost + totalSach;

  const ueberschuss = revenue - totalCost;
  const personalCostRatio = revenue === 0 ? 0 : personalCost / revenue;

  return {
    totalCost,
    personalCost,
    mieteJahr,
    sachkostenJahr,
    untermieteJahr,
    totalSach,
    revenue,
    totalIncome,
    revenueTherapy,
    ueberschuss,
    personalCostRatio,
    employeeDetails,
  };
}
