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
        primary: "#4F46E5",
        sidebar: {
          bg: "#1E1B4B",
          hover: "#312E81",
          active: "#4338CA",
          icon: "#2D2A6E",
        },
        topbar: "#FFFFFF",
        tab: {
          active: "#4F46E5",
          inactive: "#6B7280",
          border: "#E5E7EB",
        },
        table: {
          header: "#F9FAFB",
          border: "#E5E7EB",
          row: "#FFFFFF",
          rowHover: "#F3F4F6",
        },
        status: {
          complete: "#10B981",
        },
        brand: {
          red: "#EF4444",
          blue: "#3B82F6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
