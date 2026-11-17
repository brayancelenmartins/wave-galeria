import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#E4DCCA", light: "#EFE9DC", dark: "#D6CCB6" },
        ink: { DEFAULT: "#0F151C", soft: "#3B424D", mute: "#6F7480" },
        navy: { DEFAULT: "#0C2543", deep: "#081A31" },
        wave: { DEFAULT: "#1B6FC2", light: "#5FA8E0", pale: "#DBE8F9" },
        sun: "#C8372D",
      },
      fontFamily: {
        display: ['"Oswald Variable"', "Impact", "sans-serif"],
        sans: ['"DM Sans Variable"', "system-ui", "sans-serif"],
      },
      letterSpacing: { caps: "0.18em" },
      maxWidth: { site: "1440px" },
      boxShadow: {
        frame: "0 18px 40px -18px rgba(15,21,28,.45), 0 2px 6px rgba(15,21,28,.18)",
      },
    },
  },
  plugins: [],
};
export default config;
