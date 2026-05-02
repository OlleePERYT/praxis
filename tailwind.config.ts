import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "var(--font-sans)", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          accent: "var(--color-brand-accent)",
          olive: "var(--color-brand-olive)",
          ink: "var(--color-brand-ink)",
          bg: "var(--color-brand-bg)",
          surface: "var(--color-brand-surface)",
          text: "var(--color-brand-text)",
          muted: "var(--color-brand-muted)",
        },
      },
    },
  },
} satisfies Config;
