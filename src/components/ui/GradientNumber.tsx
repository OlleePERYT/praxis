import type { ReactNode } from "react";
import { GRADIENTS } from "@/lib/colors";

export default function GradientNumber({
  children,
  size = "md",
}: {
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClass =
    size === "xl" ? "text-5xl" : size === "lg" ? "text-4xl" : "text-2xl";

  return (
    <span
      className={`inline-block font-extrabold ${sizeClass}`}
      style={{
        backgroundImage: GRADIENTS.primary,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
}
