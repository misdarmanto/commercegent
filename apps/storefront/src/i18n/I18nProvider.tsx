"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { getStoredLanguage } from "./index";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = getStoredLanguage();
    if (stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }

    const syncHtmlLang = (lng: string) => {
      document.documentElement.lang = lng;
    };
    syncHtmlLang(i18n.language);
    i18n.on("languageChanged", syncHtmlLang);
    return () => {
      i18n.off("languageChanged", syncHtmlLang);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
