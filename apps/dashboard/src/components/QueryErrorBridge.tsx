import { useEffect } from "react";
import { AppContextTypes, useAppContext } from "../context/app.context";
import { alertBridge } from "../services/alertBridge";

/**
 * Wires the module-level alertBridge (used by QueryCache/MutationCache,
 * which run outside the React tree) to the real setAppAlert from
 * AppContext. Must be rendered inside AppProvider.
 */
export default function QueryErrorBridge() {
  const { setAppAlert }: AppContextTypes = useAppContext();

  useEffect(() => {
    alertBridge.notify = setAppAlert;
  }, [setAppAlert]);

  return null;
}
