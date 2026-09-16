import { createTheme } from "@mui/material/styles";

// Same brand teal used by the admin dashboard, so the two apps read as one
// product family without sharing a theme package.
const brand = {
  teal: "#0F9B8E",
  tealDark: "#0B6E64",
  tealLight: "#5EEAD4",
  tealLighter: "#E4F7F3",
  indigo: "#6366F1",
  indigoDark: "#4338CA",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand.teal,
      dark: brand.tealDark,
      light: brand.tealLight,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: brand.indigo,
      dark: brand.indigoDark,
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F6F8FA",
      paper: "#FFFFFF",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    button: { fontWeight: 600, textTransform: "none" },
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18, paddingBlock: 9 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
  },
});
