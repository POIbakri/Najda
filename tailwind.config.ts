import type { Config } from "tailwindcss";

/**
 * Design tokens are the single source of truth — see docs/DESIGN_SYSTEM.md.
 * Do not invent ad-hoc colours; derive everything from here.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#F7F3EC", // app background — calm, legible in direct sunlight
          100: "#ECE4D6", // cards, surfaces
        },
        ink: {
          900: "#16202B", // primary text, depth (night sky over the desert)
          600: "#46535F", // secondary text
        },
        flare: {
          600: "#E4451F", // SOS + active emergency ONLY — used nowhere else
          700: "#B8350F", // SOS pressed
        },
        relief: {
          600: "#0E8C7A", // responder en route / safe / "help is coming"
        },
        amber: {
          500: "#E0A11B", // pending / searching
        },
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // role-based scale from the design system
        caption: ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["18px", { lineHeight: "1.6", fontWeight: "500" }],
        locator: ["28px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "0.08em" }],
        title: ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        hero: ["36px", { lineHeight: "1.15", fontWeight: "700" }],
      },
      borderRadius: {
        card: "16px",
      },
      spacing: {
        // 8pt grid helpers + accessibility floor
        touch: "56px", // minimum tap target
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(22, 32, 43, 0.18)",
        lift: "0 12px 40px -12px rgba(22, 32, 43, 0.28)",
      },
      keyframes: {
        heartbeat: {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(228, 69, 31, 0.45)" },
          "50%": { transform: "scale(1.035)", boxShadow: "0 0 0 28px rgba(228, 69, 31, 0)" },
        },
        approach: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        // ~1.4s slow heartbeat — a beacon. Disabled under prefers-reduced-motion (see globals.css).
        heartbeat: "heartbeat 1.4s ease-in-out infinite",
        approach: "approach 0.6s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
