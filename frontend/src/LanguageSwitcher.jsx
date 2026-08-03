import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "he", label: "עב" }
];

function LanguageSwitcher({ className }) {

  const { i18n } = useTranslation();

  const current = i18n.resolvedLanguage || i18n.language || "en";

  return (
    <div className={`language-switcher ${className || ""}`}>
      {
        LANGUAGES.map(lang => (
          <button
            key={lang.code}
            className={current === lang.code ? "lang-btn active" : "lang-btn"}
            onClick={() => i18n.changeLanguage(lang.code)}
            aria-label={`Switch to ${lang.label}`}
          >
            {lang.label}
          </button>
        ))
      }
    </div>
  );
}

export default LanguageSwitcher;
