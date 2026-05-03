"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

export type DashboardTabId = "cockpit" | "auswertung" | "vergleich";

const VALID = new Set<DashboardTabId>(["cockpit", "auswertung", "vergleich"]);

function hashToTab(hash: string): DashboardTabId {
  const h = hash.replace(/^#/, "").toLowerCase();
  if (h && VALID.has(h as DashboardTabId)) {
    return h as DashboardTabId;
  }
  return "cockpit";
}

function IconCockpit() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 15h16v2H4v-2zm2-6h8v4H6V9zm10 1h4v2h-4v-2z"
        fill="currentColor"
        opacity={0.9}
      />
      <circle cx="14" cy="11" r="2.25" fill="currentColor" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2a10 10 0 1 0 10 10H12V2zm0 4v8h8a8 8 0 0 0-8-8z"
        fill="currentColor"
        opacity={0.9}
      />
    </svg>
  );
}

function IconCompare() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h6v12H4V6zm10 0h6v12h-6V6zm2 3v6h2V9h-2z"
        fill="currentColor"
        opacity={0.9}
      />
    </svg>
  );
}

type DashboardTabsProps = {
  cockpit: ReactNode;
  auswertung: ReactNode;
  vergleich: ReactNode;
};

export function DashboardTabs({ cockpit, auswertung, vergleich }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>(() =>
    typeof window !== "undefined" ? hashToTab(window.location.hash) : "cockpit",
  );

  const syncFromHash = useCallback(() => {
    setActiveTab(hashToTab(typeof window !== "undefined" ? window.location.hash : ""));
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("popstate", syncFromHash);
    return () => window.removeEventListener("popstate", syncFromHash);
  }, [syncFromHash]);

  const selectTab = (tab: DashboardTabId) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  const tabs: { id: DashboardTabId; label: string; icon: ReactNode }[] = [
    { id: "cockpit", label: "Cockpit", icon: <IconCockpit /> },
    { id: "auswertung", label: "Auswertung", icon: <IconChart /> },
    { id: "vergleich", label: "Vergleich", icon: <IconCompare /> },
  ];

  return (
    <>
      <nav
        className="sticky top-[132px] z-[25] border-b border-[var(--color-brand-border-soft)] bg-brand-bg/85 py-3 backdrop-blur-md"
        aria-label="Dashboard-Bereiche"
      >
        <div className="mx-auto flex max-w-7xl justify-center">
          <div className="inline-flex gap-1 rounded-full bg-brand-surface/60 p-1">
            {tabs.map(({ id, label, icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectTab(id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-brand-primary shadow-sm"
                      : "text-brand-muted hover:bg-white/50 hover:text-brand-ink"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="shrink-0">{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

        <div className="mx-auto w-full max-w-7xl pb-6 pt-6">
        {activeTab === "cockpit" ? cockpit : null}
        {activeTab === "auswertung" ? auswertung : null}
        {activeTab === "vergleich" ? vergleich : null}
      </div>
    </>
  );
}
