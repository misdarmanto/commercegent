type AlertPayload = {
  isDisplayAlert: boolean;
  alertType: "error" | "info" | "warning" | "success" | undefined;
  message: string;
};

/**
 * QueryCache/MutationCache callbacks run outside the React tree, so they
 * can't call useAppContext() directly. AppProvider wires `notify` to
 * setAppAlert once on mount (see QueryErrorBridge in App.tsx).
 */
export const alertBridge: { notify: (alert: AlertPayload) => void } = {
  notify: () => {},
};

export function notifyErrorAlert(message: string): void {
  alertBridge.notify({ isDisplayAlert: true, alertType: "error", message });
}
