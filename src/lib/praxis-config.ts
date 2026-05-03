import type { BrandingConfig } from "@/lib/branding";
import {
  SACH_OHNE_MIETE,
  type Employee,
  type PraxisConfig,
  type RevenueConfigDirect,
  type RevenueConfigMix,
  type SachkostenConfig,
  type SachkostenConfigDetail,
  type SachkostenConfigDirect,
} from "@/lib/engine";

const defaultRevenue: RevenueConfigDirect = {
  mode: "direct",
  revPerHour: 75,
};

const DEFAULT_SACHKOSTEN_DETAIL = {
  raumNebenkosten: 4000,
  material: 3000,
  software: 2500,
  versicherungen: 1500,
  marketing: 3500,
  sonstiges: 9500,
} as const;

export function defaultEmployee(index: number): Employee {
  return {
    name: `Therapeut:in ${index + 1}`,
    hours: 20,
    rate: 25,
    vacation: 30,
    sick: 5,
    training: 5,
    trainingCost: 1000,
  };
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeSachkosten(raw: unknown): SachkostenConfig {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { mode: "direct", value: raw };
  }

  if (typeof raw === "object" && raw !== null) {
    const r = raw as Record<string, unknown>;
    if (r.mode === "detail") {
      return {
        mode: "detail",
        raumNebenkosten: asNumber(
          r.raumNebenkosten,
          DEFAULT_SACHKOSTEN_DETAIL.raumNebenkosten,
        ),
        material: asNumber(r.material, DEFAULT_SACHKOSTEN_DETAIL.material),
        software: asNumber(r.software, DEFAULT_SACHKOSTEN_DETAIL.software),
        versicherungen: asNumber(
          r.versicherungen,
          DEFAULT_SACHKOSTEN_DETAIL.versicherungen,
        ),
        marketing: asNumber(r.marketing, DEFAULT_SACHKOSTEN_DETAIL.marketing),
        sonstiges: asNumber(r.sonstiges, DEFAULT_SACHKOSTEN_DETAIL.sonstiges),
      };
    }
    if (r.mode === "direct") {
      return { mode: "direct", value: asNumber(r.value, SACH_OHNE_MIETE) };
    }
  }

  return { mode: "direct", value: SACH_OHNE_MIETE };
}

export function sachkostenDirectToDetail(
  config: SachkostenConfigDirect,
): SachkostenConfigDetail {
  const total = config.value;
  const baseTotal = 24000;
  const ratio = (defaultValue: number) =>
    Math.round((defaultValue / baseTotal) * total);
  return {
    mode: "detail",
    raumNebenkosten: ratio(DEFAULT_SACHKOSTEN_DETAIL.raumNebenkosten),
    material: ratio(DEFAULT_SACHKOSTEN_DETAIL.material),
    software: ratio(DEFAULT_SACHKOSTEN_DETAIL.software),
    versicherungen: ratio(DEFAULT_SACHKOSTEN_DETAIL.versicherungen),
    marketing: ratio(DEFAULT_SACHKOSTEN_DETAIL.marketing),
    sonstiges: ratio(DEFAULT_SACHKOSTEN_DETAIL.sonstiges),
  };
}

export function sachkostenDetailToDirect(
  config: SachkostenConfigDetail,
): SachkostenConfigDirect {
  return {
    mode: "direct",
    value:
      config.raumNebenkosten +
      config.material +
      config.software +
      config.versicherungen +
      config.marketing +
      config.sonstiges,
  };
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
        training: asNumber(e.training, fallback.training),
        trainingCost: asNumber(e.trainingCost, fallback.trainingCost),
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
      bgPct: asNumber(revenueNode?.bgPct ?? source.bgPct, 0),
      gkvPerTreatment: asNumber(revenueNode?.gkvPerTreatment ?? source.gkvPerTreatment, 35),
      pkvPerTreatment: asNumber(revenueNode?.pkvPerTreatment ?? source.pkvPerTreatment, 49),
      bgPerTreatment: asNumber(
        revenueNode?.bgPerTreatment ?? source.bgPerTreatment,
        38,
      ),
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

  const branding: BrandingConfig = {};
  const rawBranding = source.branding;
  if (typeof rawBranding === "object" && rawBranding !== null) {
    const b = rawBranding as Record<string, unknown>;
    if (typeof b.primaryColor === "string" && /^#[0-9a-f]{6}$/i.test(b.primaryColor)) {
      branding.primaryColor = b.primaryColor;
    }
    if (typeof b.accentColor === "string" && /^#[0-9a-f]{6}$/i.test(b.accentColor)) {
      branding.accentColor = b.accentColor;
    }
  }

  return {
    employees,
    branding,
    revenue,
    mieteMonat: asNumber(source.mieteMonat, 1200),
    untermiete: asNumber(source.untermiete, 0),
    handelswareJahr: asNumber(source.handelswareJahr, 0),
    sachkosten: normalizeSachkosten(source.sachkosten),
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

/** JSON-Schlüssel für den gespeicherten Was-wäre-wenn-Vergleichspunkt (nicht Teil von PraxisConfig). */
export const COMPARISON_ANCHOR_KEY = "comparisonAnchor" as const;

export function praxisConfigToPlainObject(c: PraxisConfig): Record<string, unknown> {
  const revenue =
    c.revenue.mode === "direct"
      ? { mode: "direct" as const, revPerHour: c.revenue.revPerHour }
      : {
          mode: "mix" as const,
          gkvPct: c.revenue.gkvPct,
          pkvPct: c.revenue.pkvPct,
          bgPct: c.revenue.bgPct,
          gkvPerTreatment: c.revenue.gkvPerTreatment,
          pkvPerTreatment: c.revenue.pkvPerTreatment,
          bgPerTreatment: c.revenue.bgPerTreatment,
          selfPerTreatment: c.revenue.selfPerTreatment,
          treatmentsPerHour: c.revenue.treatmentsPerHour,
          utilization: c.revenue.utilization,
        };

  const sachkosten =
    c.sachkosten.mode === "direct"
      ? { mode: "direct" as const, value: c.sachkosten.value }
      : {
          mode: "detail" as const,
          raumNebenkosten: c.sachkosten.raumNebenkosten,
          material: c.sachkosten.material,
          software: c.sachkosten.software,
          versicherungen: c.sachkosten.versicherungen,
          marketing: c.sachkosten.marketing,
          sonstiges: c.sachkosten.sonstiges,
        };

  const out: Record<string, unknown> = {
    employees: c.employees.map((e) => ({ ...e })),
    revenue,
    mieteMonat: c.mieteMonat,
    untermiete: c.untermiete,
    handelswareJahr: c.handelswareJahr,
    sachkosten,
    refRevenue: c.refRevenue,
    refCosts: c.refCosts,
    refSurplus: c.refSurplus,
    refLabel: c.refLabel,
    gfGehaltMonat: c.gfGehaltMonat,
    inhaberEntnahmeMonat: c.inhaberEntnahmeMonat,
  };

  if (c.branding && Object.keys(c.branding).length > 0) {
    out.branding = c.branding;
  }

  return out;
}

/**
 * Zerlegt rohe Practice-JSON (inkl. optionalem Vergleichspunkt) für Laden aus der DB.
 */
export function splitPracticeConfigRaw(raw: unknown): {
  withoutAnchor: unknown;
  anchor: { savedAt: string; snapshot: PraxisConfig } | null;
} {
  if (typeof raw !== "object" || raw === null) {
    return { withoutAnchor: {}, anchor: null };
  }
  const o = { ...(raw as Record<string, unknown>) };
  const ca = o[COMPARISON_ANCHOR_KEY];
  delete o[COMPARISON_ANCHOR_KEY];

  if (
    typeof ca === "object" &&
    ca !== null &&
    typeof (ca as Record<string, unknown>).savedAt === "string"
  ) {
    const snapRaw = (ca as Record<string, unknown>).snapshot;
    if (snapRaw !== undefined) {
      const snapshot = normalizePraxisConfig(snapRaw);
      return {
        withoutAnchor: o,
        anchor: {
          savedAt: (ca as Record<string, unknown>).savedAt as string,
          snapshot,
        },
      };
    }
  }

  return { withoutAnchor: o, anchor: null };
}

/** Baut das komplette DB-Dokument (Praxisdaten + optionaler Vergleichspunkt). */
export function buildPracticeConfigDocument(
  config: PraxisConfig,
  comparisonAnchor: { savedAt: string; snapshot: PraxisConfig } | null,
): Record<string, unknown> {
  const doc = praxisConfigToPlainObject(config);
  if (comparisonAnchor) {
    doc[COMPARISON_ANCHOR_KEY] = {
      savedAt: comparisonAnchor.savedAt,
      snapshot: praxisConfigToPlainObject(comparisonAnchor.snapshot),
    };
  }
  return doc;
}
