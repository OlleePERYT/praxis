import { DEFAULT_ACCENT, DEFAULT_PRIMARY } from "./colors";

export interface BrandingConfig {
  primaryColor?: string;
  accentColor?: string;
}

/**
 * Effektive primary/accent-Farben für Tenant-Branding.
 * Nur primary gesetzt → accent wird um 20 %-Punkte im HSL-L-Raum aufgehellt.
 */
export function resolveBranding(branding: BrandingConfig | undefined): {
  primary: string;
  accent: string;
} {
  // TEMP: Tenant-Branding deaktiviert für v5-Refactor. Reaktivierung später.
  void branding;
  return {
    primary: DEFAULT_PRIMARY,
    accent: DEFAULT_ACCENT,
  };

  // -- Original-Logik bleibt unten als Kommentar / dead code --
  // const primary = branding?.primaryColor || DEFAULT_PRIMARY;
  // const accent =
  //   branding?.accentColor ||
  //   (branding?.primaryColor ? lightenHex(branding.primaryColor, 20) : DEFAULT_ACCENT);
  // return { primary, accent };
}

/** Bei Reaktivierung Tenant-Branding wieder von resolveBranding aufrufen. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- bis Reaktivierung resolveBranding
function lightenHex(hex: string, percent: number): string {
  const cleaned = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(cleaned)) return hex;

  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const newL = Math.min(1, l + percent / 100);

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
  const p = 2 * newL - q;
  const newR = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const newG = Math.round(hue2rgb(p, q, h) * 255);
  const newB = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return `#${[newR, newG, newB]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}
