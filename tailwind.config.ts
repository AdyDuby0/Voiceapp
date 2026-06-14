import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm, modern dark palette — the "polished" differentiator.
        ink: {
          900: "#0b0d12",
          800: "#12151c",
          700: "#1a1f2a",
          600: "#252b38",
          500: "#323a4d",
        },
        accent: {
          DEFAULT: "#6366f1",
          soft: "#818cf8",
          glow: "#a5b4fc",
        },
      },
      keyframes: {
        "speak-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(129, 140, 248, 0.55)" },
          "50%": { boxShadow: "0 0 0 6px rgba(129, 140, 248, 0)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "speak-pulse": "speak-pulse 1.4s ease-in-out infinite",
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
