import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext(null);

const SYMBOLS = {
  USD: "$",
  ILS: "₪"
};

export function CurrencyProvider({ children }) {

  const [currency, setCurrency] = useState(
    () => localStorage.getItem("currency") === "ILS" ? "ILS" : "USD"
  );

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const symbol = SYMBOLS[currency];

  // Display-only — swaps the symbol next to the same number, no exchange
  // rate conversion. The amounts stored in the database aren't tagged with
  // a currency, so there's nothing to actually convert.
  const formatMoney = (amount) => `${symbol}${amount}`;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, formatMoney }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
