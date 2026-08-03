import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import he from "./locales/he.json";

export const RTL_LANGUAGES = ["he"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      he: { translation: he }
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "he"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"]
    },
    interpolation: {
      escapeValue: false
    }
  });

const applyDirection = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = RTL_LANGUAGES.includes(lng) ? "rtl" : "ltr";
};

applyDirection(i18n.resolvedLanguage || i18n.language);

i18n.on("languageChanged", applyDirection);

export default i18n;
