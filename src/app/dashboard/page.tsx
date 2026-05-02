import type { CSSProperties } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PracticeFooter } from "@/components/PracticeFooter";
import { PracticeHeader } from "@/components/PracticeHeader";
import { SimulatorClient } from "@/components/SimulatorClient";
import { db } from "@/db";
import { resolveBranding } from "@/lib/branding";
import { normalizePraxisConfig } from "@/lib/praxis-config";
import { getPracticeFromHeaders } from "@/lib/tenant";

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
  const { primary, accent } = resolveBranding(initialConfig.branding);

  const tenantCssVars = {
    "--c-primary": primary,
    "--c-accent": accent,
  } as CSSProperties;

  return (
    <div className="flex min-h-screen flex-col" style={tenantCssVars}>
      <PracticeHeader practiceName={practice.name} />
      <div className="flex min-h-0 flex-1 flex-col">
        <SimulatorClient initialConfig={initialConfig} />
      </div>
      <PracticeFooter />
    </div>
  );
}
