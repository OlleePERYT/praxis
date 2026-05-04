import type { BrandingConfig } from "@/lib/branding";

const AG = 1.21;
const AG_MINIJOB = 1.32;
const WEEKS = 52;
/** Jahresfixkosten ohne Miete (Default Direct-Modus); Wert unverändert lassen. */
export const SACH_OHNE_MIETE = 24020;

export type EmploymentType = "festangestellt" | "minijob";
export type WageMode = "hourly" | "monthly";
export type EmployerCostMode = "factor" | "manual";

/**
 * AG-Faktor je Beschäftigungsart.
 * - festangestellt: 1.21 (Pauschalaufschlag SV-AG-Anteil)
 * - minijob: 1.32 (gewerblicher Minijob 2026: ~31,17 % Minijob-Zentrale + ~1 % BG)
 */
export function agFactor(type: EmploymentType | undefined): number {
  return type === "minijob" ? AG_MINIJOB : AG;
}

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
  /** Beschäftigungsart; Default "festangestellt" (AG-Faktor 1.21). */
  employmentType?: EmploymentType;
  /** Eingabe-Form Lohn; Default "hourly" (Status quo: rate × hours × 52). */
  wageMode?: WageMode;
  /** Bruttomonatsgehalt; nur wirksam wenn wageMode === "monthly". */
  monthlyGross?: number;
  /** Form der AG-Nebenkosten; Default "factor" (Pauschal-Aufschlag via agFactor). */
  employerCostMode?: EmployerCostMode;
  /** Manuelle AG-Nebenkosten pro Monat; nur wirksam wenn employerCostMode === "manual". */
  employerCostManualMonat?: number;
}

/** Jahresbrutto (vor AG-Aufschlag) je Mitarbeiter:in. */
function getEmployeeBruttoYear(employee: Employee): number {
  if (employee.wageMode === "monthly") {
    return (employee.monthlyGross ?? 0) * 12;
  }
  return employee.rate * employee.hours * WEEKS;
}

/** AG-Nebenkosten/Jahr je Mitarbeiter:in (Pauschal-Aufschlag oder manueller Wert). */
function getEmployeeAgAufschlagYear(employee: Employee): number {
  if (employee.employerCostMode === "manual") {
    return (employee.employerCostManualMonat ?? 0) * 12;
  }
  const brutto = getEmployeeBruttoYear(employee);
  return brutto * (agFactor(employee.employmentType) - 1);
}

/**
 * Jahres-Personalkosten (Brutto + AG-Aufschlag).
 * Mit Default-Feldern äquivalent zu rate × hours × 52 × AG.
 */
export function getEmployeePersonnelCostYear(employee: Employee): number {
  return getEmployeeBruttoYear(employee) + getEmployeeAgAufschlagYear(employee);
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
  /** Bundeseinheitlicher GKV (BG) – Anteil neben GKV/PKV/Selbstzahler. */
  bgPct: number;
  gkvPerTreatment: number;
  pkvPerTreatment: number;
  bgPerTreatment: number;
  selfPerTreatment: number;
  treatmentsPerHour: number;
  utilization: number;
}

export interface PraxisConfig {
  employees: Employee[];
  /** Tenant-Branding (JSON config); keine Auswirkung auf calculatePraxis. */
  branding?: BrandingConfig;
  revenue: RevenueConfigDirect | RevenueConfigMix;
  mieteMonat: number;
  untermiete: number;
  sachkosten: SachkostenConfig;
  /** Rohertrag Handelsware (Jahr), z. B. Verkauf abzgl. Wareneinkauf. */
  handelswareJahr: number;
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
  /** Rohertrag Handelsware (Jahr). */
  handelswareJahr: number;
  totalSach: number;
  /** Jahresumsatz (Therapie + Untermiete + Handelsware); identisch zu totalIncome */
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
  const selfPct = Math.max(
    0,
    100 - revenue.gkvPct - revenue.pkvPct - revenue.bgPct,
  );
  const avgPerTreatment =
    (revenue.gkvPct * revenue.gkvPerTreatment +
      revenue.pkvPct * revenue.pkvPerTreatment +
      revenue.bgPct * revenue.bgPerTreatment +
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
  bg: number;
  self: number;
} {
  const selfPct = Math.max(
    0,
    100 - config.gkvPct - config.pkvPct - config.bgPct,
  );
  const u = config.utilization / 100;
  const tph = config.treatmentsPerHour;
  const gkv =
    (config.gkvPct / 100) * config.gkvPerTreatment * tph * u;
  const pkv =
    (config.pkvPct / 100) * config.pkvPerTreatment * tph * u;
  const bg =
    (config.bgPct / 100) * config.bgPerTreatment * tph * u;
  const self =
    (selfPct / 100) * config.selfPerTreatment * tph * u;
  return { effective: gkv + pkv + bg + self, selfPct, gkv, pkv, bg, self };
}

export function calculatePraxis(config: PraxisConfig): PraxisResult {
  const employeeDetails = config.employees.map((employee) => {
    const offWeeks =
      (employee.vacation + employee.sick + employee.training) / 5;
    const effWeeks = WEEKS - offWeeks;
    const effHours = employee.hours * effWeeks;
    const cost = getEmployeePersonnelCostYear(employee);

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
  const handelswareJahr = config.handelswareJahr;
  const revenue = revenueTherapy + untermieteJahr + handelswareJahr;
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
    handelswareJahr,
    totalSach,
    revenue,
    totalIncome,
    revenueTherapy,
    ueberschuss,
    personalCostRatio,
    employeeDetails,
  };
}

/** KPI-Auszug für Szenario-Vergleiche (nutzt {@link calculatePraxis}). */
export function computeScenarioKpis(config: PraxisConfig): {
  ueberschuss: number;
  revenue: number;
  totalCost: number;
  personalCostRatio: number;
  totalEffHours: number;
  gkvAnteilProzent: number | null;
  revenueDetails: {
    revenueTherapy: number;
    untermieteJahr: number;
    handelswareJahr: number;
  };
  costDetails: {
    personalCost: number;
    sachkostenJahr: number;
    mieteJahr: number;
    trainingCostTotal: number;
  };
  personalDetails: Array<{
    name: string;
    cost: number;
    effHours: number;
    db: number;
  }>;
} {
  const r = calculatePraxis(config);
  const totalEffHours = r.employeeDetails.reduce(
    (sum, employee) => sum + employee.effHours,
    0,
  );
  const gkvAnteilProzent =
    config.revenue.mode === "mix"
      ? Math.min(100, Math.max(0, config.revenue.gkvPct))
      : null;

  const personalDetails: Array<{
    name: string;
    cost: number;
    effHours: number;
    db: number;
  }> = [];

  config.employees.forEach((employee, index) => {
    if (employee.hours <= 0) return;
    const d = r.employeeDetails[index];
    if (!d) return;
    const maRevShare =
      totalEffHours > 0 ? r.revenueTherapy * (d.effHours / totalEffHours) : 0;
    const db = maRevShare - d.cost - employee.trainingCost;
    personalDetails.push({
      name: employee.name.trim() || `Therapeut:in ${index + 1}`,
      cost: d.cost,
      effHours: d.effHours,
      db,
    });
  });

  return {
    ueberschuss: r.ueberschuss,
    revenue: r.revenue,
    totalCost: r.totalCost,
    personalCostRatio: r.personalCostRatio,
    totalEffHours,
    gkvAnteilProzent,
    revenueDetails: {
      revenueTherapy: r.revenueTherapy,
      untermieteJahr: r.untermieteJahr,
      handelswareJahr: r.handelswareJahr,
    },
    costDetails: {
      personalCost: r.personalCost,
      sachkostenJahr: r.sachkostenJahr,
      mieteJahr: r.mieteJahr,
      trainingCostTotal: r.trainingCostTotal,
    },
    personalDetails,
  };
}