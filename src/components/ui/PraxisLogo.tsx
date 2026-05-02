export default function PraxisLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Horizontaler Balken olive */}
      <rect x="2" y="18" width="36" height="4" fill="#7A8B4D" />
      {/* Vertikaler Balken dunkel */}
      <rect x="18" y="2" width="4" height="36" fill="#1E2328" />
      {/* Kleiner Diagramm-Balken links (kürzer) */}
      <rect x="7" y="12" width="3" height="6" fill="#6B7B6E" />
      {/* Kleiner Diagramm-Balken rechts daneben (höher) */}
      <rect x="11" y="9" width="3" height="9" fill="#6B7B6E" />
    </svg>
  );
}
