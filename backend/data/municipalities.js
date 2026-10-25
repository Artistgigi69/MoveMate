// Arnona (municipal tax) contacts per city.
//
// method:
//   "auto"  — big cities with an online form we plan to fill automatically.
//             Until a form adapter exists for that city, submission falls
//             back to email (if `email` is set) or to manual.
//   "email" — we send the universal arnona letter to `email`.
//
// IMPORTANT: `email` and `formUrl` are intentionally left empty. They must be
// filled in from each municipality's official site before going live —
// never guess an address, a wrong one leaks the user's ID and lease.

const municipalities = [
  { key: "jerusalem",     he: "ירושלים",          ru: "Иерусалим",       method: "auto",  email: "", formUrl: "" },
  { key: "tel-aviv",      he: "תל אביב-יפו",      ru: "Тель-Авив-Яффо",  method: "auto",  email: "", formUrl: "" },
  { key: "haifa",         he: "חיפה",             ru: "Хайфа",           method: "auto",  email: "", formUrl: "" },
  { key: "rishon",        he: "ראשון לציון",      ru: "Ришон-ле-Цион",   method: "auto",  email: "", formUrl: "" },
  { key: "petah-tikva",   he: "פתח תקווה",        ru: "Петах-Тиква",     method: "auto",  email: "", formUrl: "" },
  { key: "ashdod",        he: "אשדוד",            ru: "Ашдод",           method: "auto",  email: "", formUrl: "" },
  { key: "netanya",       he: "נתניה",            ru: "Нетания",         method: "auto",  email: "", formUrl: "" },
  { key: "beer-sheva",    he: "באר שבע",          ru: "Беэр-Шева",       method: "auto",  email: "", formUrl: "" },
  { key: "holon",         he: "חולון",            ru: "Холон",           method: "email", email: "", formUrl: "" },
  { key: "bnei-brak",     he: "בני ברק",          ru: "Бней-Брак",       method: "email", email: "", formUrl: "" },
  { key: "ramat-gan",     he: "רמת גן",           ru: "Рамат-Ган",       method: "email", email: "", formUrl: "" },
  { key: "bat-yam",       he: "בת ים",            ru: "Бат-Ям",          method: "email", email: "", formUrl: "" },
  { key: "rehovot",       he: "רחובות",           ru: "Реховот",         method: "email", email: "", formUrl: "" },
  { key: "ashkelon",      he: "אשקלון",           ru: "Ашкелон",         method: "email", email: "", formUrl: "" },
  { key: "herzliya",      he: "הרצליה",           ru: "Герцлия",         method: "email", email: "", formUrl: "" },
  { key: "kfar-saba",     he: "כפר סבא",          ru: "Кфар-Саба",       method: "email", email: "", formUrl: "" },
  { key: "hadera",        he: "חדרה",             ru: "Хадера",          method: "email", email: "", formUrl: "" },
  { key: "modiin",        he: "מודיעין-מכבים-רעות", ru: "Модиин",        method: "email", email: "", formUrl: "" },
  { key: "raanana",       he: "רעננה",            ru: "Раанана",         method: "email", email: "", formUrl: "" },
  { key: "lod",           he: "לוד",              ru: "Лод",             method: "email", email: "", formUrl: "" },
  { key: "ramla",         he: "רמלה",             ru: "Рамле",           method: "email", email: "", formUrl: "" },
  { key: "nazareth",      he: "נצרת",             ru: "Назарет",         method: "email", email: "", formUrl: "" },
  { key: "karmiel",       he: "כרמיאל",           ru: "Кармиэль",        method: "email", email: "", formUrl: "" },
  { key: "nahariya",      he: "נהריה",            ru: "Нагария",         method: "email", email: "", formUrl: "" },
  { key: "eilat",         he: "אילת",             ru: "Эйлат",           method: "email", email: "", formUrl: "" }
];

function findMunicipality(key) {
  return municipalities.find(m => m.key === key) || null;
}

module.exports = { municipalities, findMunicipality };
