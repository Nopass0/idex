import { heroui } from "@heroui/theme";
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/**/*.tsx",
    "./node_modules/@heroui/theme/dist/components/(accordion|alert|autocomplete|avatar|badge|breadcrumbs|button|calendar|card|checkbox|chip|code|date-input|date-picker|divider|drawer|dropdown|form|image|input|input-otp|kbd|link|listbox|menu|modal|navbar|number-input|pagination|popover|progress|radio|ripple|scroll-shadow|select|skeleton|slider|snippet|spacer|spinner|toggle|table|tabs|toast|user).js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          primary: {
            50: "#e6f0ec",
            100: "#cce2d9",
            200: "#99c4b3",
            300: "#66a78d",
            400: "#338967",
            500: "#006039", // Base primary color as requested
            600: "#004e2e",
            700: "#003a22",
            800: "#002717",
            900: "#00130b",
          },
        },
      },
      dark: {
        colors: {
          primary: {
            50: "#e6f5ed",
            100: "#cceadb",
            200: "#99d5b7",
            300: "#66c093",
            400: "#33ab6f",
            500: "#008047", // Slightly lighter version for dark theme
            600: "#006639",
            700: "#004d2b",
            800: "#00331c",
            900: "#00190e",
          },
        },
      },
    },
  })],
} satisfies Config;
