import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  Employee,
  PraxisConfig,
  RevenueConfigDirect,
  RevenueConfigMix,
} from "@/lib/engine";
import { getPracticeFromHeaders } from "@/lib/tenant";
import { SimulatorClient } from "@/components/SimulatorClient";

const defaultEmployees: Employee[] = [
  {
    name: "Therapeutin 1",
    hours: 20,
    rate: 25,
    vacation: 30,
    sick: 5,
  },
];

const defaultRevenue: RevenueConfigDirect = {
  mode: "direct",
  revPerHour: 75,
};

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeConfig(rawConfig: unknown): PraxisConfig {
  const raw = typeof rawConfig === "object" && rawConfig !== null ? rawConfig : {};
  const source = raw as Record<string, unknown>;

  const rawEmployees = Array.isArray(source.employees) ? source.employees : defaultEmployees;
  const employees: Employee[] = rawEmployees.slice(0, 5).map((entry, index) => {
    const employee = (entry ?? {}) as Record<string, unknown>;
    return {
      name:
        typeof employee.name === "string" && employee.name.trim().length > 0
          ? employee.name
          : `Therapeutin ${index + 1}`,
      hours: asNumber(employee.hours, 20),
      rate: asNumber(employee.rate, 25),
      vacation: asNumber(employee.vacation, 30),
      sick: asNumber(employee.sick, 5),
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
    employees: employees.length > 0 ? employees : defaultEmployees,
    revenue,
    mieteMonat: asNumber(source.mieteMonat, 1200),
    untermiete: asNumber(source.untermiete, 0),
    sachkosten: asNumber(source.sachkosten, 24020),
  };
}

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const practiceFromHeaders = getPracticeFromHeaders(requestHeaders);

  if (!practiceFromHeaders) {
    notFound();
  }

  const practice = await db.query.practices.findFirst({
    where: (practices, { eq }) => eq(practices.id, practiceFromHeaders.id),
  });

  if (!practice) {
    notFound();
  }

  let parsedConfig: unknown = {};
  try {
    parsedConfig = JSON.parse(practice.config);
  } catch {
    parsedConfig = {};
  }

  const initialConfig = normalizeConfig(parsedConfig);

  return <SimulatorClient initialConfig={initialConfig} />;
}
