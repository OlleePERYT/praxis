import type { CSSProperties } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PracticeFooter } from "@/components/PracticeFooter";
import { SimulatorClient } from "@/components/SimulatorClient";
import { db } from "@/db";
import { resolveBranding } from "@/lib/branding";
import { calculatePraxis } from "@/lib/engine";
import { normalizePraxisConfig, splitPracticeConfigRaw } from "@/lib/praxis-config";
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

  const { withoutAnchor, anchor } = splitPracticeConfigRaw(parsedConfig);
  const initialConfig = normalizePraxisConfig(withoutAnchor);
  const initialBaseline =
    anchor !== null
      ? {
          config: anchor.snapshot,
          result: calculatePraxis(anchor.snapshot),
          savedAt: anchor.savedAt,
        }
      : null;
  const { primary, accent } = resolveBranding(initialConfig.branding);

  const tenantCssVars = {
    "--c-primary": primary,
    "--c-accent": accent,
  } as CSSProperties;

  return (
    <div
      className="relative flex min-h-screen flex-col bg-brand-bg"
      style={tenantCssVars}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 90% 10%, rgba(82,183,136,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 90%, rgba(122,139,77,0.06) 0%, transparent 50%)`,
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SimulatorClient
          practiceName={practice.name}
          initialConfig={initialConfig}
          initialBaseline={initialBaseline}
        />
        <PracticeFooter />
      </div>
    </div>
  );
}
