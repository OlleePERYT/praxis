import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { normalizePraxisConfig } from "@/lib/praxis-config";
import { getPracticeFromHeaders } from "@/lib/tenant";
import { SimulatorClient } from "@/components/SimulatorClient";

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const practiceFromHeaders = getPracticeFromHeaders(requestHeaders);

  if (!practiceFromHeaders) {
    notFound();
  }

  const practice = await db.query.practices.findFirst({
    where: (practices, { eq }) =>
      eq(practices.subdomain, practiceFromHeaders.subdomain),
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

  const initialConfig = normalizePraxisConfig(parsedConfig);

  return <SimulatorClient initialConfig={initialConfig} />;
}
