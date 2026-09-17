import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { id } from "./locales/id";

export const LANGUAGE_STORAGE_KEY = "fresh_storefront_language";
export type SupportedLanguage = "en" | "id";
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "id"];
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "id" ? "id" : DEFAULT_LANGUAGE;
}

// i18next's default export is a singleton that lives for the lifetime of
// the Node process. Guarding this with `if (!i18n.isInitialized)` caused a
// real bug: on a locale-file edit, Next's dev server (Turbopack) re-runs
// this module server-side, but the already-initialized singleton would
// keep serving its *original* (stale) resources bundle forever — SSR
// output would then permanently diverge from the fresh client bundle,
// surfacing as a hydration mismatch (e.g. a raw "chat.openButton" key
// rendered server-side vs the translated text client-side). Always
// re-running init() keeps the singleton's resources in sync with this
// module's current code, in dev and in prod alike.
if (i18n.isInitialized) {
  i18n.addResourceBundle("en", "translation", en.translation, true, true);
  i18n.addResourceBundle("id", "translation", id.translation, true, true);
} else {
  i18n.use(initReactI18next).init({
    resources: { en, id },
    // Always boot as English on both server and first client render to
    // avoid an SSR/CSR hydration mismatch; the stored preference (if any)
    // is applied client-side after mount by I18nProvider.
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
  });
}

export default i18n;
