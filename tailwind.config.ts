import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // adjust if your files live elsewhere
  ],
  theme: {
    keyframes: {
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      slideUp: {
        "0%": { transform: "translateY(20px)", opacity: "0" },
        "100%": { transform: "translateY(0)", opacity: "1" },
      },
      slideDown: {
        "0%": { transform: "translateY(-20px)", opacity: "0" },
        "100%": { transform: "translateY(0)", opacity: "1" },
      },
      scaleIn: {
        "0%": { transform: "scale(0.95)", opacity: "0" },
        "100%": { transform: "scale(1)", opacity: "1" },
      },
    },
    animation: {
      fadeIn: "fadeIn 0.3s ease-out",
      slideUp: "slideUp 0.4s ease-out",
      slideDown: "slideDown 0.4s ease-out",
      scaleIn: "scaleIn 0.25s ease-out",
    },
  },
  plugins: [],
};

export default config;
