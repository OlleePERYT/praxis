"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useCallback, useRef } from "react";

type StepSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: ReactNode;
  onChange: (value: number) => void;
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function roundToStep(value: number, min: number, step: number): number {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

function decimalsForStep(step: number): number {
  if (!Number.isFinite(step) || Number.isInteger(step)) return 0;
  const s = String(step);
  if (s.includes("e-")) {
    const m = /e-(\d+)/.exec(s);
    return m ? Number(m[1]) : 0;
  }
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}

function formatDisplay(value: number, step: number): string {
  const d = decimalsForStep(step);
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function StepSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: StepSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const clamped = clamp(value, min, max);
  const pct =
    max === min ? 0 : ((clamped - min) / (max - min)) * 100;

  const commit = useCallback(
    (raw: number) => {
      const rounded = roundToStep(raw, min, step);
      onChange(clamp(rounded, min, max));
    },
    [min, max, step, onChange],
  );

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = rect.width <= 0 ? 0 : clamp((clientX - rect.left) / rect.width, 0, 1);
      commit(min + ratio * (max - min));
    },
    [commit, min, max],
  );

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromClientX(e.clientX);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const mult = e.shiftKey ? 10 : 1;
    const delta = step * mult;

    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      commit(clamped + delta);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      commit(clamped - delta);
    }
  };

  const display = `${formatDisplay(clamped, step)}${unit ? ` ${unit}` : ""}`;

  return (
    <div className="mb-3 flex items-center gap-3 rounded-xl bg-brand-bg/50 px-4 py-3 transition-colors hover:bg-brand-bg/80">
      <div className="min-w-[140px] shrink-0">
        <div className="text-sm font-medium text-brand-text">{label}</div>
        {hint ? (
          <p className="mt-0.5 text-xs text-brand-muted">{hint}</p>
        ) : null}
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-label={label}
        className="relative h-8 flex-1 touch-none outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 rounded-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={onKeyDown}
      >
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--color-brand-border-soft)]" />
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-1.5 max-w-full -translate-y-1/2 rounded-full"
          style={{
            width: `${pct}%`,
            background: "var(--gradient-primary)",
          }}
        />
        <div
          className="pointer-events-none absolute top-1/2 z-[1] h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-[3px] border-brand-primary bg-white shadow-[0_2px_8px_rgba(45,106,79,0.3)] active:cursor-grabbing"
          style={{
            left: `${pct}%`,
          }}
        />
      </div>

      <div className="min-w-[70px] shrink-0 text-right text-sm font-bold tabular-nums text-brand-ink">
        {display}
      </div>
    </div>
  );
}
