import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { id } from "./locales/id";
import { en } from "./locales/en";

export const LANGUAGE_STORAGE_KEY = "language";

const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

i18n.use(initReactI18next).init({
  resources: { id, en },
  lng: savedLanguage === "id" ? "id" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
