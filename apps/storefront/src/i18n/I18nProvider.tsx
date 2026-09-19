"use client";

import { useEffect, type ComponentType, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { getStoredLanguage } from "./index";

// react-i18next ships its own bundled @types/react-derived prop types. In
// this monorepo apps/dashboard is still on React 18 while this app is on
// React 19, and depending on the package manager/platform's dependency
// resolution, react-i18next's .d.ts can end up resolving `react` against
// the *other* app's @types/react when type-checking here — producing a
// "ReactNode is not assignable to ReactNode" error that has nothing to do
// with this file's actual code. Re-typing the component locally with our
// own (correct, React-19) ReactNode sidesteps that cross-version mismatch
// entirely, regardless of which @types/react react-i18next's own types
// happened to resolve against.
const TypedI18nextProvider = I18nextProvider as ComponentType<{
  i18n: typeof i18n;
  children?: ReactNode;
}>;

export function I18nProvider({ children }: { children: ReactNode }) {
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

  return <TypedI18nextProvider i18n={i18n}>{children}</TypedI18nextProvider>;
}
