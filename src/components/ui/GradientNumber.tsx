"use client";

import type { ReactNode } from "react";
import { GRADIENTS } from "@/lib/colors";

export default function GradientNumber({
  children,
  size = "md",
  tone = "positive",
}: {
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  tone?: "positive" | "negative";
}) {
  const sizeClass =
    size === "xl" ? "text-5xl" : size === "lg" ? "text-4xl" : "text-2xl";

  const gradient =
    tone === "negative" ? GRADIENTS.negative : GRADIENTS.primary;

  return (
    <span
      className={`inline-block font-extrabold ${sizeClass}`}
      style={{
        backgroundImage: gradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
}
