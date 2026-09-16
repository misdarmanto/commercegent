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

if (!i18n.isInitialized) {
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
