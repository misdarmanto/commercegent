import { createTheme } from "@mui/material/styles";
import { palette } from "./palette";
import { typography } from "./typography";
import { getComponents } from "./components";

// Built the same way as apps/dashboard/src/theme/index.ts (palette +
// typography + components composed in two passes) so the storefront and
// the admin dashboard share one design system.
const baseTheme = createTheme({
  palette,
  typography,
  shape: { borderRadius: 12 },
});

export const theme = createTheme(baseTheme, {
  components: getComponents(baseTheme),
});

export { brand, neutral } from "./palette";
