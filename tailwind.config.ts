// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Includes all source files
    "./public/index.html", // Includes the HTML file
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"], // Add Inter font
      },
    },
  },
  plugins: [],
} satisfies Config;
