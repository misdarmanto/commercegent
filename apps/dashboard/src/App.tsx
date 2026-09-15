import AppRouters from "./routers";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useMemo, useState } from "react";
import { ColorModeContext } from "./context/colorMode.context";

const palette = {
  greenDark: "#1F6F5F",
  greenPrimary: "#2FA084",
  greenSoft: "#6FCF97",
  grayLight: "#EEEEEE",
} as const;

function App() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("themeMode") as "light" | "dark") || "light";
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", next);
          return next;
        });
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: palette.greenPrimary,
            dark: palette.greenDark,
            light: palette.greenSoft,
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: palette.greenDark,
            light: palette.greenSoft,
            contrastText: "#FFFFFF",
          },
          background: {
            default: mode === "dark" ? "#070A12" : "#FFFFFF",
            paper: mode === "dark" ? "#070A12" : "#FFFFFF",
          },
          text: {
            primary: mode === "dark" ? "#FFFFFF" : palette.greenDark,
            secondary:
              mode === "dark" ? palette.greenSoft : palette.greenPrimary,
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouters />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
