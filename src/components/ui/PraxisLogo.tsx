export default function PraxisLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/assets/logo.svg"
      alt="praxis-kennzahlen.de"
      width={size}
      height={size}
      style={{ display: "block" }}
    />
  );
}
