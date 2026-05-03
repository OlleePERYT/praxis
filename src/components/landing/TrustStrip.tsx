import type { ReactNode } from "react";
import { GRADIENTS } from "@/lib/colors";

function StatNum({ children }: { children: ReactNode }) {
  return (
    <span
      className="block text-[44px] font-extrabold leading-none tabular-nums"
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

export default function TrustStrip() {
  return (
    <section
      className="relative border-y border-brand-primary/12"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 120% at 0% 50%, rgba(82,183,136,0.15), transparent 55%),
          linear-gradient(135deg, #F0EDE5 0%, #E8E4D9 100%)
        `,
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 md:grid-cols-4 md:gap-6 md:px-6">
        <div className="text-center md:text-left">
          <StatNum>690 €</StatNum>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            einmalig · kein Abo
          </p>
        </div>
        <div className="text-center md:text-left">
          <StatNum>3 J.</StatNum>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Hosting garantiert
          </p>
        </div>
        <div className="text-center md:text-left">
          <StatNum>30 Min.</StatNum>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Onboarding inklusive
          </p>
        </div>
        <div className="text-center md:text-left">
          <StatNum>DE</StatNum>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Server in Deutschland
          </p>
        </div>
      </div>
    </section>
  );
}
