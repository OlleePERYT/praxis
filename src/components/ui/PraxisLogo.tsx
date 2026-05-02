export default function PraxisLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vertikaler Balken dunkel (Kreuz-Stamm) */}
      <rect x="18" y="2" width="4" height="36" fill="#1E2328" />
      {/* Horizontaler Balken olive (Kreuz-Querbalken) */}
      <rect x="2" y="18" width="36" height="4" fill="#7A8B4D" />
      {/* Kleiner Balken links oben dunkel (Diagramm) */}
      <rect x="8" y="10" width="4" height="10" fill="#1E2328" opacity="0.6" />
      {/* Kleiner Balken rechts oben olive (Diagramm) */}
      <rect x="26" y="14" width="4" height="6" fill="#7A8B4D" opacity="0.7" />
    </svg>
  );
}
