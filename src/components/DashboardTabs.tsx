"use client";

import type { ReactNode } from "react";

export type DashboardTabId = "cockpit" | "auswertung" | "vergleich";

const VALID = new Set<DashboardTabId>(["cockpit", "auswertung", "vergleich"]);

export function hashToTab(hash: string): DashboardTabId {
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

export type DashboardTabNavProps = {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
  className?: string;
};

export function DashboardTabNav({
  activeTab,
  onSelectTab,
  className = "",
}: DashboardTabNavProps) {
  const tabs: { id: DashboardTabId; label: string; icon: ReactNode }[] = [
    { id: "cockpit", label: "Cockpit", icon: <IconCockpit /> },
    { id: "auswertung", label: "Auswertung", icon: <IconChart /> },
    { id: "vergleich", label: "Vergleich", icon: <IconCompare /> },
  ];

  return (
    <nav
      className={`flex w-full justify-center ${className}`}
      aria-label="Dashboard-Bereiche"
    >
      <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-brand-surface/60 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ id, label, icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
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
    </nav>
  );
}
