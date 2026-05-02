import { C } from "@/lib/colors";

export function PracticeFooter() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: C.lightBg2, backgroundColor: C.white }}
    >
      <div
        className="mx-auto w-full max-w-7xl px-4 py-3 text-right text-xs"
        style={{ color: C.lightGray }}
      >
        praxis-kennzahlen.de · v1.0
      </div>
    </footer>
  );
}
