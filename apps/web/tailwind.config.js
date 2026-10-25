import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.resolve(__dirname, "index.html"),
    path.resolve(__dirname, "src/**/*.{ts,tsx,html}"),
    path.resolve(__dirname, "../../packages/shared/src/**/*.{ts,tsx}"),
    "./index.html",
    "./src/**/*.{ts,tsx,html}",
    "./apps/web/index.html",
    "./apps/web/src/**/*.{ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#090A0D", // Deep pitch dark background
          900: "#0F1116", // Card background
          850: "#15181F", // Elevated card / modal
          800: "#1C202A", // Input / hover background
          750: "#222733", // Intermediate border / card divider
          700: "#272C39", // Border subtle
          600: "#383E4F", // Border hover
          500: "#5D657B", // Secondary text / icon
          400: "#8E96AB", // Muted text
          200: "#D3D7E2", // Body text high contrast
          100: "#F0F2F6", // Primary white text
        },
        brand: {
          yellow: "#FACC15", // Primary bright yellow
          yellowHover: "#EAB308",
          yellowLight: "#FEF08A",
          yellowGlow: "rgba(250, 204, 21, 0.15)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        yellowGlow: "0 0 25px -5px rgba(250, 204, 21, 0.25)",
      },
    },
  },
  plugins: [],
};

