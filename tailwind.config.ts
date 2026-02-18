import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "mflix-bg": "#050505",
        "mflix-red": "#E50914",
        "mflix-surface": "#1a1a1a",
        "mflix-border": "#333333",
        "mflix-muted": "#888888",
      },
    },
  },
  plugins: [],
} satisfies Config;

