/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        glassBase: "rgba(255,255,255,0.10)",
        glassBorder: "rgba(255,255,255,0.25)",
        ink: "#0A0A0A",
        badgeBlue: "#7CC7FF",
        badgePurple: "#B79CFF",
        badgePink: "#FF9BCB",
        badgeOrange: "#FFB774",
        badgeYellow: "#FDD56B",
        badgeGreen: "#79D7A7",
        badgeRed: "#FF8F8F"
      },
      boxShadow: {
        soft: "0 12px 32px rgba(0,0,0,0.18)",
        insetGlow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.25)"
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        xl: "24px",
        "2xl": "40px"
      }
    }
  },
  plugins: []
};
