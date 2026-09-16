import { PaletteMode } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { getPalette } from "./palette";
import { typography } from "./typography";
import { getComponents } from "./components";

export function createAppTheme(mode: PaletteMode) {
  const baseTheme = createTheme({
    palette: getPalette(mode),
    typography,
    shape: { borderRadius: 12 },
  });

  return createTheme(baseTheme, {
    components: getComponents(baseTheme),
  });
}

export { brand, neutral } from "./palette";
