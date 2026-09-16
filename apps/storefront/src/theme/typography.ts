import { ThemeOptions } from "@mui/material/styles";

// Mirrors apps/dashboard/src/theme/typography.ts so both apps share the
// same type scale.
const fontFamily =
  '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const typography: ThemeOptions["typography"] = {
  fontFamily,
  h1: { fontFamily, fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2 },
  h2: { fontFamily, fontWeight: 700, fontSize: "2rem", lineHeight: 1.25 },
  h3: { fontFamily, fontWeight: 700, fontSize: "1.75rem", lineHeight: 1.3 },
  h4: { fontFamily, fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.3 },
  h5: { fontFamily, fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.4 },
  h6: { fontFamily, fontWeight: 600, fontSize: "1.0625rem", lineHeight: 1.4 },
  subtitle1: { fontWeight: 600, fontSize: "0.9375rem" },
  subtitle2: { fontWeight: 600, fontSize: "0.8125rem" },
  body1: { fontSize: "0.9375rem" },
  body2: { fontSize: "0.8125rem" },
  button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  caption: { fontSize: "0.75rem" },
  overline: { fontWeight: 700, letterSpacing: "0.08em" },
};
