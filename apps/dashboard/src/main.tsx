import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";
import { AppProvider } from "./context/app.context";
import { queryClient } from "./services/queryClient";
import QueryErrorBridge from "./components/QueryErrorBridge";
import "leaflet/dist/leaflet.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <QueryErrorBridge />
        <App />
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </AppProvider>
  </React.StrictMode>
);
