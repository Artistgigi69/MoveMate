import { useCurrency } from "./CurrencyContext";
import "./LanguageSwitcher.css";

const CURRENCIES = [
  { code: "USD", label: "$" },
  { code: "ILS", label: "₪" }
];

function CurrencySwitcher({ className }) {

  const { currency, setCurrency } = useCurrency();

  return (
    <div className={`language-switcher ${className || ""}`}>
      {
        CURRENCIES.map(cur => (
          <button
            key={cur.code}
            className={currency === cur.code ? "lang-btn active" : "lang-btn"}
            onClick={() => setCurrency(cur.code)}
            aria-label={`Switch to ${cur.code}`}
          >
            {cur.label}
          </button>
        ))
      }
    </div>
  );
}

export default CurrencySwitcher;
