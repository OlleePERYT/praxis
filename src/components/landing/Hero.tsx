"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import GradientNumber from "@/components/ui/GradientNumber";
import { GRADIENTS } from "@/lib/colors";

const ROTATING = ["Excel-Hölle.", "Excel-Stress.", "Zahlen-Chaos."];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatEuro(n: number) {
  return Math.round(n).toLocaleString("de-DE", { maximumFractionDigits: 0 });
}

export default function Hero() {
  const [hours, setHours] = useState(31);
  const [rate, setRate] = useState(26);
  const [wordIx, setWordIx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setWordIx((i) => (i + 1) % ROTATING.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const surplus = useMemo(
    () => hours * 200 - rate * 30 + 4000,
    [hours, rate],
  );

  const baselineSurplus = useMemo(() => 31 * 200 - 26 * 30 + 4000, []);
  const deltaPct =
    baselineSurplus !== 0
      ? ((surplus - baselineSurplus) / Math.abs(baselineSurplus)) * 100
      : 0;

  return (
    <section className="relative overflow-hidden bg-brand-bg">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 80% 20%, rgba(82,183,136,0.2), transparent 55%),
            radial-gradient(ellipse 60% 45% at 20% 80%, rgba(122,139,77,0.14), transparent 50%),
            radial-gradient(ellipse 50% 40% at 60% 60%, rgba(45,106,79,0.06), transparent 45%)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(#1E2328 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute right-0 top-0 hidden h-[min(420px,55vw)] w-[min(520px,90vw)] lg:block">
        <svg viewBox="0 0 420 320" className="h-full w-full" aria-hidden>
          <path
            d="M40 280 Q 120 120 200 80 Q 280 40 380 20"
            fill="none"
            stroke="#2D6A4F"
            strokeOpacity={0.35}
            strokeWidth={3}
          />
          <path
            d="M60 300 Q 140 160 220 100 Q 300 60 400 40"
            fill="none"
            stroke="#52B788"
            strokeOpacity={0.45}
            strokeWidth={2.5}
          />
          <path
            d="M20 240 Q 100 100 180 60 Q 260 30 360 10"
            fill="none"
            stroke="#7A8B4D"
            strokeOpacity={0.35}
            strokeWidth={2}
          />
          <path
            d="M80 260 Q 160 140 240 90 Q 320 55 410 35"
            fill="none"
            stroke="#3D8B68"
            strokeOpacity={0.4}
            strokeWidth={2}
          />
          <path
            d="M50 290 Q 130 180 210 130 Q 290 95 390 70"
            fill="none"
            stroke="#94B89E"
            strokeOpacity={0.5}
            strokeWidth={1.5}
          />
          <path
            d="M30 270 Q 110 130 190 85 Q 270 45 370 25"
            fill="none"
            stroke="#1d4a35"
            strokeOpacity={0.25}
            strokeWidth={2}
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-20 pt-14 md:gap-[60px] lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20 lg:[grid-template-columns:1.05fr_1fr]">
        <div>
          <Eyebrow withPulse>Für Therapiepraxen in Deutschland</Eyebrow>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-brand-ink md:text-6xl lg:text-7xl">
            Reglerziehen
            <br />
            statt{" "}
            <span className="landing-rotating-word italic">
              <span
                className="bg-clip-text text-transparent transition-opacity duration-500"
                style={{
                  backgroundImage: GRADIENTS.primary,
                }}
              >
                {ROTATING[wordIx]}
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-text md:text-xl">
            Sehen Sie sofort, wie sich eine neue Therapeutin, eine höhere
            Vergütung oder weniger Sachkosten auf Ihren Jahresüberschuss
            auswirken — ohne Tabellenkalkulation.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="#kontakt"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-[#3a8763] px-8 py-4 text-base font-semibold text-white shadow-[var(--shadow-glow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-md)]"
            >
              Jetzt anfragen →
            </Link>
            <p className="text-sm font-medium text-brand-muted">
              690 € einmalig · kein Abo
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
          <div className="pointer-events-none absolute -left-6 -top-4 hidden h-24 w-24 rounded-full border-2 border-dashed border-brand-primary/25 lg:block" />
          <div className="pointer-events-none absolute -bottom-2 -right-4 h-14 w-14 rounded-full bg-brand-primary/10" />
          <div className="pointer-events-none absolute right-8 top-12 h-3 w-3 rounded-full bg-brand-accent/60" />

          <div className="relative rounded-2xl border border-[var(--color-brand-border-soft)] bg-white/90 p-7 shadow-[var(--shadow-glow-md)] backdrop-blur-md md:p-8">
            <div
              className="pointer-events-none absolute left-0 right-0 top-0 h-1 rounded-t-2xl"
              style={{ background: "var(--gradient-primary)", height: 4 }}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">
                Live-Vorschau
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />
                interaktiv
              </span>
            </div>
            <p className="mt-4 text-lg font-bold leading-snug text-brand-ink">
              Was wäre, wenn ich eine zweite Therapeutin einstelle?
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold text-brand-text">
                  <span>Wochenstunden</span>
                  <span className="tabular-nums text-brand-primary">{hours}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  value={hours}
                  onChange={(e) =>
                    setHours(clamp(Number(e.target.value), 10, 40))
                  }
                  className="landing-hero-range mt-3 w-full"
                  aria-valuemin={10}
                  aria-valuemax={40}
                  aria-valuenow={hours}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold text-brand-text">
                  <span>Stundenlohn</span>
                  <span className="tabular-nums text-brand-primary">{rate} €</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={30}
                  value={rate}
                  onChange={(e) =>
                    setRate(clamp(Number(e.target.value), 20, 30))
                  }
                  className="landing-hero-range mt-3 w-full"
                  aria-valuemin={20}
                  aria-valuemax={30}
                  aria-valuenow={rate}
                />
              </div>
            </div>

            <div
              className="mt-8 rounded-2xl border-[1.5px] border-brand-primary/25 p-5"
              style={{
                background:
                  "linear-gradient(135deg, #E8F5EE 0%, #d4ecdf 100%)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
                Praxisüberschuss / Jahr
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <GradientNumber size="xl" tone={surplus >= 0 ? "positive" : "negative"}>
                  {surplus >= 0 ? "" : "−"}
                  {formatEuro(Math.abs(surplus))} €
                </GradientNumber>
              </div>
              <p className="mt-2 text-xs font-semibold text-brand-muted">
                ggü. heute ·{" "}
                <span className="text-brand-primary tabular-nums">
                  {deltaPct >= 0 ? "+" : "−"}
                  {Math.abs(deltaPct).toLocaleString("de-DE", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{" "}
                  %
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
