// "What else to update after the move" — the steps Kol Zchut's moving guide
// lists (kolzchut.org.il/he/מדריך_למעבר_דירה, updated 2026-09-14), with the
// official service pages. Each link was opened on 2026-10-27. Labels live in
// i18n.jsx as "after.<key>" and "after.<key>Hint". Order matters: the
// population registry comes first, Bituach Leumi only after it.

export const AFTER_MOVE = [
  { key: "moi", url: "https://www.gov.il/he/service/changing_address" },
  { key: "btl", url: "https://ps.btl.gov.il/" },
  { key: "post", url: "https://israelpost.co.il/%D7%93%D7%95%D7%90%D7%A8-%D7%91%D7%90%D7%A8%D7%A5/%D7%93%D7%95%D7%90%D7%A8-%D7%A2%D7%95%D7%A7%D7%91/" },
  { key: "city", url: "" },
  { key: "kupah", url: "" },
  { key: "banks", url: "" },
  { key: "insurance", url: "" },
  { key: "army", url: "" }
];

// The full guide in the reader's language (no English version; Hebrew then).
export const MOVING_GUIDE = {
  he: "https://www.kolzchut.org.il/he/%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%9E%D7%A2%D7%91%D7%A8_%D7%93%D7%99%D7%A8%D7%94",
  ru: "https://www.kolzchut.org.il/ru/%D0%A0%D1%83%D0%BA%D0%BE%D0%B2%D0%BE%D0%B4%D1%81%D1%82%D0%B2%D0%BE_%D0%BF%D0%BE_%D0%BF%D0%B5%D1%80%D0%B5%D0%B5%D0%B7%D0%B4%D1%83_%D0%BD%D0%B0_%D0%B4%D1%80%D1%83%D0%B3%D1%83%D1%8E_%D0%BA%D0%B2%D0%B0%D1%80%D1%82%D0%B8%D1%80%D1%83",
  ar: "https://www.kolzchut.org.il/ar/%D8%AF%D9%84%D9%8A%D9%84_%D8%AD%D9%82%D9%88%D9%82_%D8%A7%D9%84%D8%A7%D9%86%D8%AA%D9%82%D8%A7%D9%84_%D9%85%D9%86_%D8%B4%D9%82%D8%A9"
};
