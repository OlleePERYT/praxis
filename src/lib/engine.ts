const AG = 1.21;
const WEEKS = 52;
/** Jahresfixkosten ohne Miete (Default Direct-Modus); Wert unverändert lassen. */
export const SACH_OHNE_MIETE = 24020;

export interface Employee {
  name: string;
  hours: number;
  rate: number;
  vacation: number;
  sick: number;
  /** Weiterbildungstage pro Jahr (wie Urlaub/Krankheit in Arbeitstage/5 → Wochen). */
  training: number;
  /** Weiterbildungskosten pro Jahr (Sachkosten SKR03/04, nicht Personalkosten). */
  trainingCost: number;
}

export interface SachkostenConfigDirect {
  mode: "direct";
  value: number;
}

export interface SachkostenConfigDetail {
  mode: "detail";
  raumNebenkosten: number;
  material: number;
  software: number;
  versicherungen: number;
  marketing: number;
  sonstiges: number;
}

export type SachkostenConfig =
  | SachkostenConfigDirect
  | SachkostenConfigDetail;

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
  sachkosten: SachkostenConfig;
  refRevenue: number;
  refCosts: number;
  refSurplus: number;
  refLabel: string;
  gfGehaltMonat: number;
  inhaberEntnahmeMonat: number;
}

export interface PraxisResult {
  totalCost: number;
  /** Personalkosten inkl. GF-Gehalt (Anzeige / Quote). */
  personalCost: number;
  /** Personalkosten nur Mitarbeitende (ohne GF-Gehalt). */
  personalCostMitarbeitende: number;
  gfGehaltJahr: number;
  inhaberEntnahmeJahr: number;
  ueberschussNachEntnahme: number;
  mieteJahr: number;
  sachkostenJahr: number;
  /** Summe Weiterbildungskosten aller MA (Sachkosten). */
  trainingCostTotal: number;
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
    trainingCost: number;
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

export function getSachkostenJahr(config: SachkostenConfig): number {
  if (config.mode === "direct") {
    return config.value;
  }
  return (
    config.raumNebenkosten +
    config.material +
    config.software +
    config.versicherungen +
    config.marketing +
    config.sonstiges
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
    const offWeeks =
      (employee.vacation + employee.sick + employee.training) / 5;
    const effWeeks = WEEKS - offWeeks;
    const effHours = employee.hours * effWeeks;
    const cost = employee.rate * employee.hours * WEEKS * AG;

    return {
      name: employee.name,
      effWeeks,
      effHours,
      cost,
      trainingCost: employee.trainingCost,
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
  const personalCostMitarbeitende = personalCost;
  const gfGehaltJahr = config.gfGehaltMonat * 12;
  const personalCostMitGf = personalCost + gfGehaltJahr;

  const trainingCostTotal = employeeDetails.reduce(
    (s, e) => s + e.trainingCost,
    0,
  );

  const mieteJahr = config.mieteMonat * 12;
  const sachkostenJahr = getSachkostenJahr(config.sachkosten);
  const totalSach = sachkostenJahr + mieteJahr + trainingCostTotal;
  const totalCost = personalCostMitGf + totalSach;

  const ueberschuss = revenue - totalCost;
  const personalCostRatio =
    revenue === 0 ? 0 : personalCostMitGf / revenue;

  const inhaberEntnahmeJahr = config.inhaberEntnahmeMonat * 12;
  const ueberschussNachEntnahme = ueberschuss - inhaberEntnahmeJahr;

  return {
    totalCost,
    personalCost: personalCostMitGf,
    personalCostMitarbeitende,
    gfGehaltJahr,
    inhaberEntnahmeJahr,
    ueberschussNachEntnahme,
    mieteJahr,
    sachkostenJahr,
    trainingCostTotal,
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
