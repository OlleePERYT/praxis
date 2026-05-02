import Image from "next/image";

export default function PraxisLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/assets/logo.svg"
      alt="praxis-kennzahlen.de"
      width={size}
      height={size}
      priority
    />
  );
}
