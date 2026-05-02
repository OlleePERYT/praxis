import { calculatePraxis, type PraxisConfig } from "./engine";

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
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 60,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: 0,
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
      },
    ],
    revenue: {
      mode: "mix",
      gkvPct: 70,
      pkvPct: 30,
      gkvPerTreatment: 30,
      pkvPerTreatment: 50,
      selfPerTreatment: 80,
      treatmentsPerHour: 1,
      utilization: 100,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: 0,
    ...refDefaults,
  };

  const result = calculatePraxis(config);

  const expectedAvgPerTreatment = (70 * 30 + 30 * 50 + 0 * 80) / 100;
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
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: 0,
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
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: 0,
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
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: 0,
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
      },
    ],
    revenue: {
      mode: "direct",
      revPerHour: 50,
    },
    mieteMonat: 0,
    untermiete: 0,
    sachkosten: 0,
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

console.log("Alle Engine-Tests erfolgreich.");
