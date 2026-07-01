import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          50: "#f5f6f7",
          100: "#e8eaec",
          800: "#1a1d23",
          900: "#121418",
          950: "#0b0c0f",
        },
        accent: {
          DEFAULT: "#ff6a3d",
          light: "#ff8a63",
          dark: "#e5541f",
        },
        ok: "#3ddc97",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      spacing: {
        "safe-b": "env(safe-area-inset-bottom)",
        "safe-t": "env(safe-area-inset-top)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translate(-50%, 8px)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" },
        },
        "toast-out": {
          "0%": { opacity: "1", transform: "translate(-50%, 0)" },
          "100%": { opacity: "0", transform: "translate(-50%, 8px)" },
        },
      },
      animation: {
        "toast-in": "toast-in 150ms ease-out",
        "toast-out": "toast-out 150ms ease-in forwards",
      },
    },
  },
  plugins: [],
};

export default config;
