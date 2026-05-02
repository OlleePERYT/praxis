"use client";

import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  variant?: "default" | "gradient-top" | "glow";
  className?: string;
  /** Innenabstand des Inhalts (Standard: p-6). */
  contentClassName?: string;
};

export default function Card({
  children,
  variant = "default",
  className = "",
  contentClassName = "p-6",
}: CardProps) {
  const base =
    "relative overflow-hidden rounded-2xl border border-brand-surface bg-white";

  let variantClasses = "";
  if (variant === "glow") {
    variantClasses = "shadow-[var(--shadow-glow-md)]";
  }

  return (
    <div className={`${base} ${variantClasses} ${className}`.trim()}>
      {variant === "gradient-top" ? (
        <div
          className="h-1 w-full"
          style={{ backgroundImage: "var(--gradient-primary)" }}
          aria-hidden
        />
      ) : null}
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
