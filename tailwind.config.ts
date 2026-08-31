import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm neutral base
        canvas: "#FBFAF7",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1C1B19",
          soft: "#4A4844",
          muted: "#6E6B65",
          faint: "#97938B",
        },
        line: {
          DEFAULT: "#E9E5DD",
          strong: "#DDD8CE",
        },
        // Confident brand accent — deep jade
        brand: {
          50: "#EEF6F2",
          100: "#D5E9DF",
          200: "#A9D2BF",
          300: "#74B79A",
          400: "#409A75",
          500: "#177F58",
          600: "#0E6B49",
          700: "#0B573C",
          800: "#0A4531",
          900: "#083729",
        },
        accentwarm: "#C9722E",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        serifcv: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      fontSize: {
        "display-lg": ["clamp(2.6rem, 5.2vw, 4.4rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display": ["clamp(2.1rem, 4vw, 3.3rem)", { lineHeight: "1.06", letterSpacing: "-0.025em" }],
        "heading": ["clamp(1.7rem, 3vw, 2.4rem)", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(28, 27, 25, 0.04), 0 1px 3px rgba(28, 27, 25, 0.03)",
        card: "0 4px 18px -6px rgba(28, 27, 25, 0.10), 0 2px 6px -2px rgba(28, 27, 25, 0.05)",
        lift: "0 18px 44px -14px rgba(28, 27, 25, 0.22), 0 6px 14px -6px rgba(28, 27, 25, 0.10)",
        paper: "0 24px 60px -20px rgba(28, 27, 25, 0.28), 0 8px 20px -10px rgba(28, 27, 25, 0.12)",
        btn: "0 1px 2px rgba(11, 87, 60, 0.28), 0 2px 8px -2px rgba(11, 87, 60, 0.30)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.15rem",
      },
      maxWidth: {
        content: "1180px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
