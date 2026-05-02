import type { ReactNode } from "react";

export default function Eyebrow({
  children,
  withPulse = false,
}: {
  children: ReactNode;
  withPulse?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">
      {withPulse ? (
        <span
          className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-brand-primary"
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
