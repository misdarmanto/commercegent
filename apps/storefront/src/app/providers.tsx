"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { theme } from "@/theme";
import { getQueryClient } from "@/lib/queryClient";
import { I18nProvider } from "@/i18n/I18nProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Not useState(makeQueryClient) — see the comment on getQueryClient for
  // why that's unsafe under Next dev's Strict Mode double-mount.
  const queryClient = getQueryClient();

  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </AppRouterCacheProvider>
  );
}
