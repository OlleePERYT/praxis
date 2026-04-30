import { calculatePraxis, type PraxisConfig } from "./engine";

function approxEqual(actual: number, expected: number, epsilon = 1e-9): boolean {
  return Math.abs(actual - expected) < epsilon;
}

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

// Test 3: Untermiete 300/Monat erhoeht Umsatz um 3600 pro Jahr.
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
  };

  const withoutUntermiete = calculatePraxis(baseConfig);
  const withUntermiete = calculatePraxis({ ...baseConfig, untermiete: 300 });

  console.assert(
    approxEqual(withUntermiete.revenue - withoutUntermiete.revenue, 3600),
    "Test 3 fehlgeschlagen: Untermiete sollte Umsatz um 3600 erhoehen.",
  );
}

console.log("Alle Engine-Tests erfolgreich.");
