import { resolveBranding } from "./branding";
import { DEFAULT_ACCENT, DEFAULT_PRIMARY } from "./colors";
import {
  calculatePraxis,
  getEffectiveRevPerHour,
  getSachkostenJahr,
  SACH_OHNE_MIETE,
  type PraxisConfig,
  type RevenueConfigMix,
} from "./engine";
import {
  normalizePraxisConfig,
  sachkostenDetailToDirect,
  sachkostenDirectToDetail,
} from "./praxis-config";

function approxEqual(actual: number, expected: number, epsilon = 1e-6): boolean {
  return Math.abs(actual - expected) < epsilon;
}

const refDefaults = {
  refRevenue: 0,
  refCosts: 0,
  refSurplus: 0,
  refLabel: "Bisher",
  gfGehaltMonat: 0,
  inhaberEntnahmeMonat: 0,
  handelswareJahr: 0,
};

// Test 1: Direct-Modus, 1 Mitarbeiter, positiver Ueberschuss.
{
  const config: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 20,
        rate: 25,
        vacation: 30,
        sick: 5,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 60,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    ...refDefaults,
  };

  const result = calculatePraxis(config);
  console.assert(result.ueberschuss > 0, "Test 1 fehlgeschlagen: Ueberschuss sollte positiv sein.");
}

// Test 2: Mix-Modus, korrekte Gewichtung avgPerTreatment.
{
  const config: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 10,
        rate: 20,
        vacation: 0,
        sick: 0,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: {
      mode: "mix",
      gkvPct: 70,
      pkvPct: 30,
      bgPct: 0,
      gkvPerTreatment: 30,
      pkvPerTreatment: 50,
      bgPerTreatment: 38,
      selfPerTreatment: 80,
      treatmentsPerHour: 1,
      utilization: 100,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    ...refDefaults,
  };

  const result = calculatePraxis(config);

  const expectedAvgPerTreatment =
    (70 * 30 + 30 * 50 + 0 * 38 + 0 * 80) / 100;
  const totalEffHours = 10 * 52;
  const expectedRevenue = totalEffHours * expectedAvgPerTreatment;

  console.assert(
    approxEqual(result.revenue, expectedRevenue),
    "Test 2 fehlgeschlagen: Mix-Gewichtung fuer avgPerTreatment ist nicht korrekt.",
  );
}

// Test 3: Untermiete 300/Monat: Umsatz +3600, Kosten unveraendert => Ueberschuss +3600.
{
  const baseConfig: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 10,
        rate: 20,
        vacation: 0,
        sick: 0,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    ...refDefaults,
  };

  const withoutUntermiete = calculatePraxis(baseConfig);
  const withUntermiete = calculatePraxis({ ...baseConfig, untermiete: 300 });

  console.assert(
    approxEqual(withUntermiete.revenue - withoutUntermiete.revenue, 3600),
    "Test 3a fehlgeschlagen: Untermiete sollte Umsatz um 3600 erhoehen.",
  );
  console.assert(
    approxEqual(
      withUntermiete.ueberschuss - withoutUntermiete.ueberschuss,
      3600,
    ),
    "Test 3b fehlgeschlagen: Untermiete sollte Ueberschuss um 3600 erhoehen (sonstige Einnahme).",
  );
}

// Test 4: Regression – GF und Entnahme 0 → gleiche Kernkennzahlen wie bisher; neue Felder konsistent.
{
  const baseForGF: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 10,
        rate: 20,
        vacation: 0,
        sick: 0,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    gfGehaltMonat: 0,
    inhaberEntnahmeMonat: 0,
    ...refDefaults,
  };

  const r = calculatePraxis(baseForGF);
  const empSum = r.employeeDetails.reduce((s, e) => s + e.cost, 0);

  const totalEffHours = 10 * 52;
  const expectedRevenueTherapy = totalEffHours * 50;
  const expectedPersonal = 10 * 20 * 52 * 1.21;
  const expectedTotalCost = expectedPersonal;
  const expectedUeberschuss = expectedRevenueTherapy - expectedTotalCost;
  const expectedPkRatio =
    expectedRevenueTherapy === 0 ? 0 : expectedPersonal / expectedRevenueTherapy;

  console.assert(
    approxEqual(r.revenue, expectedRevenueTherapy),
    "Test 4-Ref: revenue wie ohne GF/Entnahme-Felder.",
  );
  console.assert(
    approxEqual(r.personalCost, expectedPersonal),
    "Test 4-Ref: personalCost wie ohne GF/Entnahme-Felder.",
  );
  console.assert(
    approxEqual(r.totalCost, expectedTotalCost),
    "Test 4-Ref: totalCost wie ohne GF/Entnahme-Felder.",
  );
  console.assert(
    approxEqual(r.ueberschuss, expectedUeberschuss),
    "Test 4-Ref: ueberschuss wie ohne GF/Entnahme-Felder.",
  );
  console.assert(
    approxEqual(r.personalCostRatio, expectedPkRatio),
    "Test 4-Ref: personalCostRatio wie ohne GF/Entnahme-Felder.",
  );

  console.assert(
    approxEqual(r.personalCostMitarbeitende, empSum),
    "Test 4a: personalCostMitarbeitende = Summe MA-Kosten.",
  );
  console.assert(
    approxEqual(r.personalCost, empSum),
    "Test 4b: personalCost bei GF=0 wie MA-Summe.",
  );
  console.assert(r.gfGehaltJahr === 0, "Test 4c: gfGehaltJahr 0.");
  console.assert(r.inhaberEntnahmeJahr === 0, "Test 4d: inhaberEntnahmeJahr 0.");
  console.assert(
    approxEqual(r.ueberschussNachEntnahme, r.ueberschuss),
    "Test 4e: ueberschussNachEntnahme === ueberschuss ohne Entnahme.",
  );
}

// Test 5: GmbH – GF-Gehalt erhöht Personalkosten und Gesamtkosten, Entnahme 0.
{
  const baseForGF: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 10,
        rate: 20,
        vacation: 0,
        sick: 0,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    gfGehaltMonat: 0,
    inhaberEntnahmeMonat: 0,
    ...refDefaults,
  };

  const reg = calculatePraxis(baseForGF);
  const gmbh = calculatePraxis({ ...baseForGF, gfGehaltMonat: 5000 });

  console.assert(gmbh.gfGehaltJahr === 60000, "Test 5a: gfGehaltJahr 60000.");
  console.assert(
    approxEqual(
      gmbh.personalCostMitarbeitende,
      reg.personalCostMitarbeitende,
    ),
    "Test 5b: MA-Personalkosten unveraendert.",
  );
  console.assert(
    approxEqual(gmbh.personalCost, reg.personalCost + 60000),
    "Test 5c: personalCost inkl. GF.",
  );
  console.assert(
    approxEqual(gmbh.totalCost, reg.totalCost + 60000),
    "Test 5d: totalCost +60000.",
  );
  console.assert(
    approxEqual(gmbh.ueberschuss, reg.ueberschuss - 60000),
    "Test 5e: ueberschuss -60000.",
  );
  console.assert(
    gmbh.personalCostRatio > reg.personalCostRatio,
    "Test 5f: PK-Quote mit GF hoeher.",
  );
  console.assert(
    approxEqual(gmbh.ueberschussNachEntnahme, gmbh.ueberschuss),
    "Test 5g: ueberschussNachEntnahme ohne Entnahme = ueberschuss.",
  );
}

// Test 6: Einzelunternehmen – Entnahme mindert nur ueberschussNachEntnahme, nicht GuV-Kennzahlen.
{
  const baseForGF: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 10,
        rate: 20,
        vacation: 0,
        sick: 0,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    gfGehaltMonat: 0,
    inhaberEntnahmeMonat: 0,
    ...refDefaults,
  };

  const reg = calculatePraxis(baseForGF);
  const eu = calculatePraxis({ ...baseForGF, inhaberEntnahmeMonat: 3000 });

  console.assert(eu.inhaberEntnahmeJahr === 36000, "Test 6a: inhaberEntnahmeJahr 36000.");
  console.assert(
    approxEqual(eu.revenue, reg.revenue),
    "Test 6b: revenue unveraendert.",
  );
  console.assert(
    approxEqual(eu.personalCost, reg.personalCost),
    "Test 6c: personalCost unveraendert.",
  );
  console.assert(
    approxEqual(eu.totalCost, reg.totalCost),
    "Test 6d: totalCost unveraendert.",
  );
  console.assert(
    approxEqual(eu.ueberschuss, reg.ueberschuss),
    "Test 6e: ueberschuss unveraendert.",
  );
  console.assert(
    approxEqual(eu.ueberschussNachEntnahme, reg.ueberschuss - 36000),
    "Test 6f: ueberschussNachEntnahme -36000.",
  );
}

// Test 7: Regression – training=0, trainingCost=0 → gleiche Kennzahlen wie Referenz; trainingCostTotal 0.
{
  const config: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 10,
        rate: 20,
        vacation: 0,
        sick: 0,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    gfGehaltMonat: 0,
    inhaberEntnahmeMonat: 0,
    ...refDefaults,
  };

  const r = calculatePraxis(config);
  const totalEffHours = 10 * 52;
  const expectedRevenueTherapy = totalEffHours * 50;
  const expectedPersonal = 10 * 20 * 52 * 1.21;
  const expectedUeberschuss = expectedRevenueTherapy - expectedPersonal;
  const expectedPkRatio =
    expectedRevenueTherapy === 0 ? 0 : expectedPersonal / expectedRevenueTherapy;

  console.assert(r.trainingCostTotal === 0, "Test 7a: trainingCostTotal 0.");
  console.assert(
    approxEqual(r.ueberschuss, expectedUeberschuss),
    "Test 7b: ueberschuss wie ohne Trainingsfelder.",
  );
  console.assert(
    approxEqual(r.personalCostRatio, expectedPkRatio),
    "Test 7c: personalCostRatio unveraendert.",
  );
}

// Test 8: Trainings-Tage – effHours/Revenue sinken; Personalkosten und Sachkosten (ohne Fortbildungskosten) unveraendert.
{
  const baseEmp = {
    name: "Therapeutin 1",
    hours: 10,
    rate: 20,
    vacation: 0,
    sick: 0,
    training: 0,
    trainingCost: 0,
  };
  const baseConfig: PraxisConfig = {
    employees: [baseEmp],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    ...refDefaults,
  };

  const baseline = calculatePraxis(baseConfig);
  const withTraining = calculatePraxis({
    ...baseConfig,
    employees: [{ ...baseEmp, training: 10 }],
  });

  console.assert(
    approxEqual(withTraining.trainingCostTotal, 0),
    "Test 8a: trainingCostTotal 0 bei trainingCost=0.",
  );
  console.assert(
    approxEqual(baseline.personalCost, withTraining.personalCost),
    "Test 8b: Personalkosten unveraendert.",
  );
  console.assert(
    approxEqual(baseline.totalSach, withTraining.totalSach),
    "Test 8c: totalSach unveraendert (keine Fortbildungskosten).",
  );
  const effHoursBase = 10 * 52;
  const effHoursTrain = 10 * (52 - 10 / 5);
  const expectedRevDrop = (effHoursBase - effHoursTrain) * 50;
  console.assert(
    approxEqual(
      baseline.revenueTherapy - withTraining.revenueTherapy,
      expectedRevDrop,
    ),
    "Test 8d: Therapie-Umsatz sinkt um effHours-Delta * rev/h.",
  );
}

// Test 9: Trainings-Kosten – Sachkosten/Überschuss; Personalkosten und PK-Quote unveraendert.
{
  const baseEmp = {
    name: "Therapeutin 1",
    hours: 10,
    rate: 20,
    vacation: 0,
    sick: 0,
    training: 0,
    trainingCost: 0,
  };
  const baseConfig: PraxisConfig = {
    employees: [baseEmp],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    ...refDefaults,
  };

  const baseline = calculatePraxis(baseConfig);
  const withCost = calculatePraxis({
    ...baseConfig,
    employees: [{ ...baseEmp, trainingCost: 2000 }],
  });

  console.assert(withCost.trainingCostTotal === 2000, "Test 9a: trainingCostTotal 2000.");
  console.assert(
    approxEqual(withCost.totalSach, baseline.totalSach + 2000),
    "Test 9b: totalSach +2000.",
  );
  console.assert(
    approxEqual(withCost.personalCost, baseline.personalCost),
    "Test 9c: Personalkosten unveraendert.",
  );
  console.assert(
    approxEqual(withCost.personalCostRatio, baseline.personalCostRatio),
    "Test 9d: personalCostRatio unveraendert.",
  );
  console.assert(
    approxEqual(withCost.ueberschuss, baseline.ueberschuss - 2000),
    "Test 9e: ueberschuss -2000.",
  );
}

// Test 10: Sachkosten Direct value=24020 → sachkostenJahr/totalSach wie früher skalar 24020.
{
  const emp = {
    name: "Therapeutin 1",
    hours: 10,
    rate: 20,
    vacation: 0,
    sick: 0,
    training: 0,
    trainingCost: 0,
  };
  const config: PraxisConfig = {
    employees: [emp],
    revenue: { mode: "direct", revPerHour: 50 },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 24020 },
    ...refDefaults,
  };
  const r = calculatePraxis(config);
  const pk = 10 * 20 * 52 * 1.21;
  const rev = 10 * 52 * 50;
  console.assert(r.sachkostenJahr === 24020, "Test 10a: sachkostenJahr 24020.");
  console.assert(r.totalSach === 24020, "Test 10b: totalSach nur Sach (ohne Miete/Fortbildung).");
  console.assert(
    approxEqual(r.ueberschuss, rev - pk - 24020),
    "Test 10c: ueberschuss konsistent mit Direct-24020.",
  );
}

// Test 11: Detail-Defaults Σ=24000 → +24000 totalSach ggü. Sach=0; PK unverändert.
{
  const emp = {
    name: "Therapeutin 1",
    hours: 10,
    rate: 20,
    vacation: 0,
    sick: 0,
    training: 0,
    trainingCost: 0,
  };
  const detailSach = {
    mode: "detail" as const,
    raumNebenkosten: 4000,
    material: 3000,
    software: 2500,
    versicherungen: 1500,
    marketing: 3500,
    sonstiges: 9500,
  };
  const base: PraxisConfig = {
    employees: [emp],
    revenue: { mode: "direct", revPerHour: 50 },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    ...refDefaults,
  };
  const withDetail: PraxisConfig = { ...base, sachkosten: detailSach };
  const r0 = calculatePraxis(base);
  const r1 = calculatePraxis(withDetail);
  console.assert(r1.sachkostenJahr === 24000, "Test 11a: Detail-Summe 24000.");
  console.assert(
    approxEqual(r1.totalSach, r0.totalSach + 24000),
    "Test 11b: totalSach +24000.",
  );
  console.assert(
    approxEqual(r1.personalCost, r0.personalCost),
    "Test 11c: Personalkosten unveraendert.",
  );
}

// Test 12: getSachkostenJahr + Mode-Wechsel-Helper.
{
  console.assert(
    getSachkostenJahr({ mode: "direct", value: 30000 }) === 30000,
    "Test 12a: getSachkostenJahr direct.",
  );
  const detailDefaults = {
    mode: "detail" as const,
    raumNebenkosten: 4000,
    material: 3000,
    software: 2500,
    versicherungen: 1500,
    marketing: 3500,
    sonstiges: 9500,
  };
  console.assert(
    getSachkostenJahr(detailDefaults) === 24000,
    "Test 12b: getSachkostenJahr detail.",
  );
  const toDirect = sachkostenDetailToDirect(detailDefaults);
  console.assert(toDirect.value === 24000, "Test 12c: sachkostenDetailToDirect.");
  const fromDirect = sachkostenDirectToDetail({ mode: "direct", value: 24000 });
  const sumDetail =
    fromDirect.raumNebenkosten +
    fromDirect.material +
    fromDirect.software +
    fromDirect.versicherungen +
    fromDirect.marketing +
    fromDirect.sonstiges;
  console.assert(
    Math.abs(sumDetail - 24000) <= 5,
    "Test 12d: DirectToDetail Summe ≈ 24000 (Rundung).",
  );
}

// Test 13: normalizePraxisConfig Migration Sachkosten.
{
  const nScalar = normalizePraxisConfig({ sachkosten: 24020 });
  console.assert(
    nScalar.sachkosten.mode === "direct" && nScalar.sachkosten.value === 24020,
    "Test 13a: skalar → direct 24020.",
  );
  const detailIn = {
    mode: "detail" as const,
    raumNebenkosten: 4000,
    material: 3000,
    software: 2500,
    versicherungen: 1500,
    marketing: 3500,
    sonstiges: 9500,
  };
  const nDetail = normalizePraxisConfig({ sachkosten: detailIn });
  console.assert(nDetail.sachkosten.mode === "detail", "Test 13b: detail mode.");
  if (nDetail.sachkosten.mode === "detail") {
    console.assert(nDetail.sachkosten.raumNebenkosten === 4000, "Test 13c: raum.");
    console.assert(nDetail.sachkosten.sonstiges === 9500, "Test 13d: sonstiges.");
  }
  const nEmpty = normalizePraxisConfig({});
  console.assert(
    nEmpty.sachkosten.mode === "direct" && nEmpty.sachkosten.value === SACH_OHNE_MIETE,
    "Test 13e: default direct SACH_OHNE_MIETE.",
  );
  console.assert(nEmpty.handelswareJahr === 0, "Test 13f: handelswareJahr default 0.");
  console.assert(
    Object.keys(nEmpty.branding ?? {}).length === 0,
    "Test 13g: branding default leer.",
  );
}

// Test 14: Mix mit bgPct=0 → gleiches effektives €/h wie ohne BG-Term (Regression).
{
  const mix: RevenueConfigMix = {
    mode: "mix",
    gkvPct: 70,
    pkvPct: 30,
    bgPct: 0,
    bgPerTreatment: 38,
    gkvPerTreatment: 30,
    pkvPerTreatment: 50,
    selfPerTreatment: 80,
    treatmentsPerHour: 1,
    utilization: 100,
  };
  const selfPctLegacy = Math.max(0, 100 - mix.gkvPct - mix.pkvPct);
  const avgLegacy =
    (mix.gkvPct * mix.gkvPerTreatment +
      mix.pkvPct * mix.pkvPerTreatment +
      selfPctLegacy * mix.selfPerTreatment) /
    100;
  const eff = getEffectiveRevPerHour(mix);
  console.assert(
    approxEqual(eff, avgLegacy * mix.treatmentsPerHour * (mix.utilization / 100)),
    "Test 14: bg=0 entspricht historischer Mix-Berechnung.",
  );
}

// Test 15: Mix mit BG-Anteil – selfPct und Umsatz.
{
  const config: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 10,
        rate: 20,
        vacation: 0,
        sick: 0,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: {
      mode: "mix",
      gkvPct: 60,
      pkvPct: 20,
      bgPct: 10,
      gkvPerTreatment: 35,
      pkvPerTreatment: 49,
      bgPerTreatment: 38,
      selfPerTreatment: 45,
      treatmentsPerHour: 1,
      utilization: 100,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    ...refDefaults,
  };

  const selfPct = Math.max(0, 100 - 60 - 20 - 10);
  console.assert(selfPct === 10, "Test 15a: selfPct 10.");

  const expectedAvg =
    (60 * 35 + 20 * 49 + 10 * 38 + 10 * 45) / 100;
  const totalEffHours = 10 * 52;
  const expectedRevenueTherapy = totalEffHours * expectedAvg;
  const result = calculatePraxis(config);
  console.assert(
    approxEqual(result.revenueTherapy, expectedRevenueTherapy),
    "Test 15b: Therapie-Umsatz mit BG-Anteil.",
  );
}

// Test 16: handelswareJahr – Zusatzumsatz ohne Therapie-Erlös; PK-Quote sinkt leicht.
{
  const base: PraxisConfig = {
    employees: [
      {
        name: "Therapeutin 1",
        hours: 10,
        rate: 20,
        vacation: 0,
        sick: 0,
        training: 0,
        trainingCost: 0,
      },
    ],
    revenue: { mode: "direct", revPerHour: 50 },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    handelswareJahr: 0,
    ...refDefaults,
  };
  const withHw = { ...base, handelswareJahr: 1500 };
  const r0 = calculatePraxis(base);
  const r1 = calculatePraxis(withHw);

  console.assert(r1.handelswareJahr === 1500, "Test 16a: handelswareJahr durchgereicht.");
  console.assert(
    approxEqual(r1.revenue, r0.revenue + 1500),
    "Test 16b: Gesamtumsatz +1500.",
  );
  console.assert(
    approxEqual(r1.revenueTherapy, r0.revenueTherapy),
    "Test 16c: Therapie-Umsatz unveraendert.",
  );
  console.assert(
    approxEqual(r1.ueberschuss, r0.ueberschuss + 1500),
    "Test 16d: Ueberschuss +1500.",
  );
  console.assert(
    r1.personalCostRatio < r0.personalCostRatio,
    "Test 16e: PK-Quote sinkt (hoeherer Nenner).",
  );
}

// Test 17: branding beeinflusst calculatePraxis nicht.
{
  const emp = {
    name: "Therapeutin 1",
    hours: 10,
    rate: 20,
    vacation: 0,
    sick: 0,
    training: 0,
    trainingCost: 0,
  };
  const base: PraxisConfig = {
    employees: [emp],
    revenue: { mode: "direct", revPerHour: 50 },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: { mode: "direct", value: 0 },
    ...refDefaults,
  };
  const withBrand: PraxisConfig = {
    ...base,
    branding: { primaryColor: "#aa0000", accentColor: "#00ff00" },
  };
  const r0 = calculatePraxis(base);
  const r1 = calculatePraxis(withBrand);
  console.assert(
    approxEqual(r1.ueberschuss, r0.ueberschuss),
    "Test 17a: ueberschuss mit branding gleich.",
  );
  console.assert(
    approxEqual(r1.revenueTherapy, r0.revenueTherapy),
    "Test 17b: revenueTherapy mit branding gleich.",
  );
}

// Test 18: normalizePraxisConfig branding.
{
  const noBrand = normalizePraxisConfig({});
  console.assert(
    Object.keys(noBrand.branding ?? {}).length === 0,
    "Test 18a: ohne branding-Feld → leeres Objekt.",
  );

  const invalidPrimary = normalizePraxisConfig({
    branding: { primaryColor: "red" },
  });
  console.assert(
    invalidPrimary.branding?.primaryColor === undefined,
    "Test 18b: ungueltiges primary ignoriert.",
  );

  const validPrimary = normalizePraxisConfig({
    branding: { primaryColor: "#aabbcc" },
  });
  console.assert(
    validPrimary.branding?.primaryColor === "#aabbcc",
    "Test 18c: gueltiges Hex uebernommen.",
  );
}

// Test 19: resolveBranding.
{
  const d = resolveBranding(undefined);
  console.assert(
    d.primary === DEFAULT_PRIMARY && d.accent === DEFAULT_ACCENT,
    "Test 19a: Defaults ohne branding.",
  );

  const onlyP = resolveBranding({ primaryColor: "#000000" });
  console.assert(onlyP.primary === "#000000", "Test 19b: primary gesetzt.");
  console.assert(onlyP.accent !== "#000000", "Test 19c: accent abgeleitet (heller).");

  const both = resolveBranding({
    primaryColor: "#000000",
    accentColor: "#ffffff",
  });
  console.assert(both.primary === "#000000" && both.accent === "#ffffff", "Test 19d: beide gesetzt.");
}

console.log("Alle Engine-Tests erfolgreich.");
