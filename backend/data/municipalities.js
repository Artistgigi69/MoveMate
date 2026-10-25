// Arnona (municipal tax) change-of-occupant channels per city.
//
// method:
//   "email" — the municipality's own site gives an email for these notices:
//             we send the universal arnona letter there.
//   "form"  — only an online form is offered: the user fills it in
//             (`formUrl`); a candidate for automatic filling later.
//   ""      — not found yet; the user contacts the city themselves.
//
// water (optional): the city's water corporation, where the user moves the
// water account. Only filled where an official page named it.
//
// Every email/form below was read on the city's official page in `source`
// (checked 2026-10-25). Never add a guessed address: a wrong one leaks the
// user's ID number and lease to a stranger. Re-check before going live —
// municipalities move these pages often.

const municipalities = [
  {
    key: "jerusalem", he: "ירושלים", ru: "Иерусалим",
    method: "form", email: "",
    formUrl: "https://jeronlineformsgen.jerusalem.muni.il/ExchangeHolding/Default.aspx",
    source: "https://www.jerusalem.muni.il/he/residents/arnona/transferownershipoftheproperty/",
    note: "Отдельная форма для выезда: https://jeronlineformsgen.jerusalem.muni.il/LeaveAsset/Default.aspx"
  },
  {
    key: "tel-aviv", he: "תל אביב-יפו", ru: "Тель-Авив-Яффо",
    method: "form", email: "",
    formUrl: "https://holders.tel-aviv.gov.il/",
    source: "https://www.tel-aviv.gov.il/Residents/Arnona/pages/arnonaswitching.aspx",
    note: "Также факс/почта с бумажной декларацией."
  },
  {
    key: "haifa", he: "חיפה", ru: "Хайфа",
    method: "email", email: "hiuvim@haifa.muni.il",
    formUrl: "https://haifaforms.haifa.muni.il/?page_id=91044",
    source: "https://www.haifa.muni.il/resident-service/arnona/switching/",
    note: "Факс 04-8356035.",
    // Named on the city's arnona page; we couldn't open its own site.
    water: { name: "Мей Кармель (מי כרמל)", url: "" }
  },
  {
    key: "rishon", he: "ראשון לציון", ru: "Ришон-ле-Цион",
    method: "form", email: "",
    formUrl: "https://cityforms.co.il:60140/appbuilder/forms?code=8102005056A175301188E8CFFEF4DE61&Process=oneproc",
    source: "https://www.rishonlezion.muni.il/Residents/arnona/Pages/PropertyTaxRenting.aspx",
    note: "",
    water: { name: "Маниб Ришон (מניב ראשון)", url: "" }
  },
  {
    key: "petah-tikva", he: "פתח תקווה", ru: "Петах-Тиква",
    method: "", email: "", formUrl: "",
    source: "https://www.petah-tikva.muni.il/arnona/ExchangeHolders",
    note: "Сайт блокирует автоматический доступ — проверить вручную."
  },
  {
    key: "ashdod", he: "אשדוד", ru: "Ашдод",
    method: "", email: "", formUrl: "",
    source: "https://www.ashdod.muni.il/media/16516411/%D7%97%D7%95%D7%91%D7%A8%D7%AA-%D7%90%D7%A8%D7%A0%D7%95%D7%A0%D7%94-2026-%D7%9E%D7%95%D7%A0%D7%92%D7%A9%D7%AA-pdfua.pdf",
    note: "Каналы описаны в PDF-брошюре 2026 (почта, лично, факс) — не удалось прочитать, проверить вручную."
  },
  {
    key: "netanya", he: "נתניה", ru: "Нетания",
    method: "form", email: "",
    formUrl: "https://por138.cityforms.co.il/appbuilder/forms?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=101&SUG=1",
    source: "https://www.netanya.muni.il/Residents/Arnona/CustomerService/Pages/default.aspx",
    note: "Выезд: та же форма с SUG=5."
  },
  {
    key: "beer-sheva", he: "באר שבע", ru: "Беэр-Шева",
    method: "email", email: "mokedg@br7.org.il",
    formUrl: "https://por162.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=B809005056B8060C11DD0B2422DCF607&Process=GVIYA_MAHZIKIM",
    source: "https://www.beer-sheva.muni.il/Residents/Arnona/Pages/HilufeiBealim.aspx",
    note: ""
  },
  {
    key: "holon", he: "חולון", ru: "Холон",
    method: "form", email: "",
    formUrl: "https://por134.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=8145005056A14F7F11CCD5B6BC7D267C&Process=ProcessOneClick&NOSE=1&TAT=101&SUG=7",
    source: "http://www.holon.muni.il/Residents/TaxesWater/Pages/default.aspx",
    note: ""
  },
  {
    key: "bnei-brak", he: "בני ברק", ru: "Бней-Брак",
    method: "email", email: "gviya1@bbm.org.il",
    formUrl: "https://forms.bbm.org.il/%D7%A9%D7%99%D7%A0%D7%95%D7%99-%D7%9E%D7%97%D7%96%D7%99%D7%A7-%D7%91%D7%A0%D7%9B%D7%A1/",
    source: "https://www.bnei-brak.muni.il/%d7%a0%d7%95%d7%94%d7%9c-%d7%97%d7%99%d7%9c%d7%95%d7%a4%d7%99-%d7%9e%d7%97%d7%96%d7%99%d7%a7-%d7%91%d7%a0%d7%9b%d7%a1/",
    note: "Факс 03-5776211."
  },
  {
    key: "ramat-gan", he: "רמת גן", ru: "Рамат-Ган",
    method: "", email: "", formUrl: "",
    source: "https://smart-digital.ramat-gan.muni.il/",
    note: "Сайт не открылся — проверить вручную."
  },
  {
    key: "bat-yam", he: "בת ים", ru: "Бат-Ям",
    method: "form", email: "",
    formUrl: "https://forms.milgam.co.il/bat-yam/forms/162/",
    source: "https://www.bat-yam.muni.il/he/122/",
    note: ""
  },
  {
    key: "rehovot", he: "רחובות", ru: "Реховот",
    method: "form", email: "",
    formUrl: "https://www.rehovot.muni.il/flowmateapp.php?name=%D7%94%D7%97%D7%9C%D7%A4%D7%94%20%D7%9E%D7%91%D7%A2%D7%9C%D7%99%D7%9D%20%D7%9C%D7%93%D7%99%D7%99%D7%A8%D7%99%D7%9D",
    source: "https://www.rehovot.muni.il/%D7%94%D7%97%D7%9C%D7%A4%D7%AA-%D7%9E%D7%97%D7%96%D7%99%D7%A7%D7%99%D7%9D-%D7%91%D7%A0%D7%9B%D7%A1/",
    note: "Отдельные формы: жилец→жилец, владелец→жилец, возврат владельцу.",
    water: { name: "А-Беэр а-Шлишит (הבאר השלישית)", url: "http://www.habeer3.co.il/122/" }
  },
  {
    key: "ashkelon", he: "אשקלון", ru: "Ашкелон",
    method: "", email: "", formUrl: "",
    source: "https://ashkelon.muni.gov.il/he",
    note: "Сайт не открылся — проверить вручную."
  },
  {
    key: "herzliya", he: "הרצליה", ru: "Герцлия",
    method: "form", email: "",
    formUrl: "https://por131.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=1001&SUG=1",
    source: "https://www.herzliya.muni.il/רישום-מחזיקים-בארנונה/",
    note: "Выезд: та же форма с SUG=10."
  },
  {
    key: "kfar-saba", he: "כפר סבא", ru: "Кфар-Саба",
    method: "form", email: "",
    formUrl: "https://www.kfar-saba.muni.il/2987/",
    source: "https://www.kfar-saba.muni.il/חילופי-דיירים-בנכס/",
    note: ""
  },
  {
    key: "hadera", he: "חדרה", ru: "Хадера",
    method: "", email: "", formUrl: "",
    source: "https://www.hadera.muni.il/%d7%98%d7%a4%d7%a1%d7%99%d7%9d/",
    note: "На странице форм нет формы смены жильца — проверить вручную."
  },
  {
    key: "modiin", he: "מודיעין-מכבים-רעות", ru: "Модиин",
    method: "", email: "", formUrl: "",
    source: "https://www.modiin.muni.il/",
    note: "Не найдено — проверить вручную."
  },
  {
    key: "raanana", he: "רעננה", ru: "Раанана",
    method: "", email: "", formUrl: "",
    source: "https://www.raanana.muni.il/residents/arnona/arnona-forms/",
    note: "Вероятно, на странице форм арноны — проверить вручную."
  },
  {
    key: "lod", he: "לוד", ru: "Лод",
    method: "", email: "", formUrl: "",
    source: "https://www.lod.muni.il/he/179/",
    note: "Есть только личные адреса сотрудников, канала для смены жильца нет."
  },
  {
    key: "ramla", he: "רמלה", ru: "Рамле",
    method: "form", email: "",
    formUrl: "https://forms.milgam.co.il/ramle/forms/64/",
    source: "https://ramle.org.il/חילופי-דיירים-בנכס/",
    note: ""
  },
  {
    key: "nazareth", he: "נצרת", ru: "Назарет",
    method: "", email: "", formUrl: "",
    source: "https://www.nazareth.muni.il/",
    note: "Не найдено — проверить вручную."
  },
  {
    key: "karmiel", he: "כרמיאל", ru: "Кармиэль",
    method: "email", email: "gvia@karmiel.muni.il",
    formUrl: "https://por193.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=101",
    source: "https://www.karmiel.muni.il/residents/arnonaservies/%d7%9e%d7%97%d7%9c%d7%a7%d7%aa-%d7%92%d7%91%d7%99%d7%99%d7%94/",
    note: "Общий email отдела взыскания; смена жильца указана среди его задач. Факс 04-9085629."
  },
  {
    key: "nahariya", he: "נהריה", ru: "Нагария",
    method: "form", email: "",
    formUrl: "https://tiktak.metropolinet.co.il/#!form/220751975577468",
    source: "https://www.nahariya.muni.il/ארנונה-ומים/",
    note: "Это общая форма обращения по арноне, не специальная."
  },
  {
    key: "eilat", he: "אילת", ru: "Эйлат",
    method: "form", email: "",
    formUrl: "https://por148.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=1001&SUG=60",
    source: "https://eilat.muni.il/חילופי-מחזיק-או-בעלים-בנכס/",
    note: ""
  }
];

function findMunicipality(key) {
  return municipalities.find(m => m.key === key) || null;
}

module.exports = { municipalities, findMunicipality };
