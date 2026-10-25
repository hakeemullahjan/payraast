import webConfig from "./apps/web/tailwind.config.js";

/** @type {import('tailwindcss').Config} */
export default {
  ...webConfig,
  content: [
    "./apps/web/index.html",
    "./apps/web/src/**/*.{ts,tsx}",
    "./packages/shared/src/**/*.{ts,tsx}",
  ],
};

