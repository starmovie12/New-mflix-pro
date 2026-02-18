import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mflix: {
          bg: "#050505",
          card: "#1a1a1a",
          accent: "#E50914",
          "accent-dark": "#D32F2F",
          border: "rgba(255,255,255,0.1)",
          muted: "#888",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "system-ui", "sans-serif"],
        inter: ["Inter", "Poppins", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
