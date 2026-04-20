import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "./modules/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F2A",
          2: "#112b38",
          3: "#18384a",
        },
        // Overrides Tailwind's built-in emerald — safe: no emerald-{n} classes used in codebase
        emerald: {
          DEFAULT: "#1FA97A",
          2: "#17c088",
          ink: "#0d7a56",
        },
        ink: {
          DEFAULT: "#0B1F2A",
          2: "#4a5a63",
          3: "#8695a0",
        },
        line: {
          DEFAULT: "#e6ebee",
          dark: "rgba(255,255,255,0.08)",
          "dark-2": "rgba(255,255,255,0.14)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "14px",
        "card-lg": "22px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,31,42,.04), 0 8px 24px rgba(11,31,42,.06)",
        pop: "0 2px 4px rgba(11,31,42,.06), 0 18px 40px rgba(11,31,42,.10)",
        nav: "0 1px 2px rgba(11,31,42,.06), 0 12px 40px rgba(11,31,42,.08)",
      },
    },
  },
  plugins: [],
}

export default config
