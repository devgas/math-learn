import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-main)", "Arial", "sans-serif"],
        dyslexia: ["var(--font-dyslexia)", "Arial", "sans-serif"]
      },
      colors: {
        ink: "#172033",
        aqua: "#13b6b0",
        mango: "#ffb84d",
        coral: "#ff6f61",
        leaf: "#66c36f",
        sky: "#66a6ff"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(23, 32, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
