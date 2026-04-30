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
}

export interface PraxisResult {
  totalCost: number;
  personalCost: number;
  mieteJahr: number;
  sachkostenJahr: number;
  revenue: number;
  ueberschuss: number;
  personalCostRatio: number;
  employeeDetails: {
    name: string;
    effWeeks: number;
    effHours: number;
    cost: number;
  }[];
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

  let effectiveRevPerHour = 0;

  if (config.revenue.mode === "direct") {
    effectiveRevPerHour = config.revenue.revPerHour;
  } else {
    const selfPct = Math.max(0, 100 - config.revenue.gkvPct - config.revenue.pkvPct);
    const avgPerTreatment =
      (config.revenue.gkvPct * config.revenue.gkvPerTreatment +
        config.revenue.pkvPct * config.revenue.pkvPerTreatment +
        selfPct * config.revenue.selfPerTreatment) /
      100;
    effectiveRevPerHour =
      avgPerTreatment *
      config.revenue.treatmentsPerHour *
      (config.revenue.utilization / 100);
  }

  const totalEffHours = employeeDetails.reduce((sum, employee) => sum + employee.effHours, 0);
  const revenueTherapy = totalEffHours * effectiveRevPerHour;
  const revenueUntermiete = config.untermiete * 12;
  const revenue = revenueTherapy + revenueUntermiete;

  const personalCost = employeeDetails.reduce((sum, employee) => sum + employee.cost, 0);
  const mieteJahr = config.mieteMonat * 12;
  const sachkostenJahr = config.sachkosten ?? SACH_OHNE_MIETE;
  const totalCost = personalCost + mieteJahr + sachkostenJahr;

  const ueberschuss = revenue - totalCost;
  const personalCostRatio = revenue === 0 ? 0 : personalCost / revenue;

  return {
    totalCost,
    personalCost,
    mieteJahr,
    sachkostenJahr,
    revenue,
    ueberschuss,
    personalCostRatio,
    employeeDetails,
  };
}
