import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./catalogs/en";
import { fr } from "./catalogs/fr";

export const LOCALE_KEY = "omnitask.locale";
export type Locale = "en" | "fr";

function readLocale(): Locale {
  const storedLocale = localStorage.getItem(LOCALE_KEY);
  return storedLocale === "fr" || storedLocale === "en" ? storedLocale : "en";
}

export function flattenKeys(value: object, prefix = ""): string[] {
  return Object.entries(value)
    .flatMap(([key, nestedValue]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return typeof nestedValue === "object" && nestedValue !== null
        ? flattenKeys(nestedValue as object, path)
        : [path];
    })
    .sort();
}

export async function setLocale(locale: Locale): Promise<void> {
  localStorage.setItem(LOCALE_KEY, locale);
  document.documentElement.lang = locale;
  await i18n.changeLanguage(locale);
}

const initialLocale = readLocale();
document.documentElement.lang = initialLocale;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr }
  },
  lng: initialLocale,
  fallbackLng: "en",
  supportedLngs: ["en", "fr"],
  interpolation: { escapeValue: false }
});

export { i18n };
