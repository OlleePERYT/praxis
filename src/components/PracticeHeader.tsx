"use client";

import { DashboardTabNav } from "@/components/DashboardTabs";
import type { DashboardTabNavProps } from "@/components/DashboardTabs";
import PraxisLogo from "@/components/ui/PraxisLogo";
import { logoutFromDashboard } from "@/app/dashboard/logout-action";

type PracticeHeaderProps = {
  practiceName: string;
  /** Wenn gesetzt, Tab-Leiste im Header (Dashboard). */
  dashboardTabs?: Pick<DashboardTabNavProps, "activeTab" | "onSelectTab">;
};

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function PracticeHeader({ practiceName, dashboardTabs }: PracticeHeaderProps) {
  const tabProps = dashboardTabs;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-brand-border-soft)] bg-brand-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <div className="flex w-full items-center justify-between gap-4 md:w-auto md:max-w-[200px] md:shrink-0 md:justify-start">
            <div className="flex min-w-0 max-w-[200px] items-center gap-2">
              <PraxisLogo size={28} />
              <h1 className="truncate text-base font-semibold text-brand-ink">
                {practiceName}
              </h1>
            </div>
            <div className="shrink-0 md:hidden">
              <form action={logoutFromDashboard}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-muted transition-colors hover:bg-brand-primary/5 hover:text-brand-primary"
                >
                  <LogoutIcon />
                  Abmelden
                </button>
              </form>
            </div>
          </div>

          {tabProps ? (
            <div className="w-full min-w-0 md:flex-1 md:flex md:justify-center">
              <DashboardTabNav
                activeTab={tabProps.activeTab}
                onSelectTab={tabProps.onSelectTab}
              />
            </div>
          ) : null}

          <div className="hidden shrink-0 md:block">
            <form action={logoutFromDashboard}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-muted transition-colors hover:bg-brand-primary/5 hover:text-brand-primary"
              >
                <LogoutIcon />
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
