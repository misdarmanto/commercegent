import { PaletteOptions } from "@mui/material/styles";

// Same brand tokens as the admin dashboard (apps/dashboard/src/theme/palette.ts)
// so the storefront reads as the same product family.
export const brand = {
  tealLighter: "#E4F7F3",
  tealLight: "#5EEAD4",
  teal: "#0F9B8E",
  tealDark: "#0B6E64",
  indigoLight: "#A5B4FC",
  indigo: "#6366F1",
  indigoDark: "#4338CA",
};

export const neutral = {
  0: "#FFFFFF",
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
  950: "#0B1120",
};

export const palette: PaletteOptions = {
  mode: "light",
  primary: {
    lighter: brand.tealLighter,
    light: brand.tealLight,
    main: brand.teal,
    dark: brand.tealDark,
    contrastText: "#FFFFFF",
  },
  secondary: {
    lighter: "#EEF2FF",
    light: brand.indigoLight,
    main: brand.indigo,
    dark: brand.indigoDark,
    contrastText: "#FFFFFF",
  },
  success: { main: "#16A34A", light: "#86EFAC", dark: "#15803D" },
  warning: { main: "#D97706", light: "#FCD34D", dark: "#B45309" },
  error: { main: "#DC2626", light: "#FCA5A5", dark: "#B91C1C" },
  info: { main: "#2563EB", light: "#93C5FD", dark: "#1D4ED8" },
  grey: neutral,
  background: {
    default: "#F6F8FA",
    paper: neutral[0],
  },
  text: {
    primary: neutral[900],
    secondary: neutral[500],
    disabled: neutral[300],
  },
  divider: neutral[200],
};

declare module "@mui/material/styles" {
  interface PaletteColor {
    lighter?: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
  }
}
