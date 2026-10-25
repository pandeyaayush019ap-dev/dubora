import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom palette provided in reference
        heather: {
          950: "#0C0A0C",
          900: "#130F12",
          850: "#1A1518",
          800: "#221C20",
          700: "#32292F",
          600: "#473B43",
          500: "#624F55", // Target swatch Heather #624F55
          400: "#806970",
          300: "#A18991",
          200: "#C4B2B8",
          100: "#E2D8DC",
        },
        duskyPink: {
          DEFAULT: "#B1968F", // Target swatch Dusky Pink #B1968F
          light: "#CDB7B2",
          lighter: "#E5D7D3",
          dark: "#8E746E",
          darker: "#6C5651",
        },
        fern: {
          DEFAULT: "#5B7373", // Target swatch Fern #5B7373
          light: "#799494",
          lighter: "#A2B7B7",
          dark: "#3F5252",
          darker: "#2A3737",
        },
        eucalyptus: {
          DEFAULT: "#9BA9AA", // Target swatch Eucalyptus #9BA9AA
          light: "#B9C4C4",
          lighter: "#DCE3E3",
          dark: "#778586",
          darker: "#546061",
        },
        quartz: {
          DEFAULT: "#E9DBD8", // Target swatch Quartz #E9DBD8
          light: "#F5EDEC",
          dark: "#D6C1BC",
          darker: "#B99E98",
        },
        feather: {
          DEFAULT: "#F6F2F1", // Target swatch Feather #F6F2F1
          pure: "#FFFFFF",
          muted: "#E8DFDE",
        },
        brand: {
          accent: "#B1968F", // Dusky pink
          secondary: "#5B7373", // Fern
          highlight: "#9BA9AA", // Eucalyptus
          surface: "#1A1518",
          border: "#32292F",
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave-bar": "waveBar 1.2s ease-in-out infinite alternate",
      },
      keyframes: {
        waveBar: {
          "0%": { height: "20%" },
          "100%": { height: "100%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
