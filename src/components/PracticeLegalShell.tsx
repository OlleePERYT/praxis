import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { PracticeFooter } from "@/components/PracticeFooter";
import PraxisLogo from "@/components/ui/PraxisLogo";
import { getSubdomainFromHost } from "@/lib/host";

export async function PracticeLegalShell({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const host = (await headers()).get("host");
  const onPracticeSubdomain = Boolean(getSubdomainFromHost(host));

  const homeHref = session
    ? "/dashboard"
    : onPracticeSubdomain
      ? "/login"
      : "/";

  const secondaryHref = session ? "/dashboard" : "/login";
  const secondaryLabel = session ? "Zum Dashboard" : "Anmelden";

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="sticky top-0 z-40 border-b border-[var(--color-brand-border-soft)] bg-brand-bg/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href={homeHref} className="flex min-w-0 items-center gap-2">
            <PraxisLogo size={28} />
            <span className="font-sans text-sm text-brand-ink">
              praxis-<span className="font-bold">kennzahlen</span>
              <span className="text-brand-primary">.de</span>
            </span>
          </Link>
          <Link
            href={secondaryHref}
            className="shrink-0 text-sm font-semibold text-brand-primary hover:underline"
          >
            {secondaryLabel}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>

      <PracticeFooter />
    </div>
  );
}
