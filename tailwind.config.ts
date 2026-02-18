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
          red: "#E50914",
          "red-dark": "#D32F2F",
          gold: "#ffc107",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      aspectRatio: {
        poster: "2 / 3",
      },
    },
  },
  plugins: [],
};
export default config;
