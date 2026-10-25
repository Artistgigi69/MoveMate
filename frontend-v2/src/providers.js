// Where the user switches each utility themselves until we can send it for
// them. Links were opened on the providers' own sites on 2026-10-25;
// re-check before going live.

export const ELECTRICITY = {
  nameKey: "provider.iec",
  url: "https://www.iec.co.il/interaction-form/changing-customers/"
};

// A building is tied to one gas company, so the user picks theirs.
// Names live in i18n.jsx as "gas.<key>".
export const GAS_PROVIDERS = [
  { key: "amisragas", url: "https://www.amisragas.co.il/subtenant/" },
  {
    key: "supergas",
    url: "https://selfservice.supergas-power.co.il/%D7%A4%D7%A2%D7%95%D7%9C%D7%95%D7%AA-%D7%91%D7%97%D7%A9%D7%91%D7%95%D7%9F"
  },
  // Pazgas sits behind a bot check, so we couldn't confirm a direct page.
  { key: "pazgas", url: "https://www.pazgas.co.il/" },
  { key: "doralon", url: "" },
  { key: "other", url: "" }
];

export const gasProvider = key => GAS_PROVIDERS.find(p => p.key === key);
