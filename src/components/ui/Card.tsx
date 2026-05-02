import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  variant?: "default" | "gradient-top" | "glow";
  className?: string;
};

export default function Card({
  children,
  variant = "default",
  className = "",
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
      <div className="p-6">{children}</div>
    </div>
  );
}
