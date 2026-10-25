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
// water account. Names come from the Water Authority's tariff book (Jan 2026,
// section 6, the list of water and sewage corporations) where the company
// name itself names the city, or from the city's own site otherwise (Tel
// Aviv, Holon, Petah Tikva, Kfar Saba, Karmiel, Haifa, Rishon). `url` is set
// only where we opened that page.
//
// Every email/form below was read on the city's official page in `source`
// (checked 2026-10-25). Never add a guessed address: a wrong one leaks the
// user's ID number and lease to a stranger. Re-check before going live —
// municipalities move these pages often.

const municipalities = [
  {
    key: "jerusalem",
    names: { he: "ירושלים", ru: "Иерусалим", en: "Jerusalem", ar: "القدس" },
    method: "form", email: "",
    formUrl: "https://jeronlineformsgen.jerusalem.muni.il/ExchangeHolding/Default.aspx",
    source: "https://www.jerusalem.muni.il/he/residents/arnona/transferownershipoftheproperty/",
    note: "Отдельная форма для выезда: https://jeronlineformsgen.jerusalem.muni.il/LeaveAsset/Default.aspx",
    water: { names: { he: "הגיחון", ru: "Гихон", en: "Hagihon", ar: "هجيحون" }, url: "" }
  },
  {
    key: "tel-aviv",
    names: { he: "תל אביב-יפו", ru: "Тель-Авив-Яффо", en: "Tel Aviv-Yafo", ar: "تل أبيب - يافا" },
    method: "form", email: "",
    formUrl: "https://holders.tel-aviv.gov.il/",
    source: "https://www.tel-aviv.gov.il/Residents/Arnona/pages/arnonaswitching.aspx",
    note: "Также факс/почта с бумажной декларацией.",
    water: { names: { he: "מי אביבים", ru: "Мей Авивим", en: "Mei Avivim", ar: "مي أفيفيم" }, url: "" }
  },
  {
    key: "haifa",
    names: { he: "חיפה", ru: "Хайфа", en: "Haifa", ar: "حيفا" },
    method: "email", email: "hiuvim@haifa.muni.il",
    formUrl: "https://haifaforms.haifa.muni.il/?page_id=91044",
    source: "https://www.haifa.muni.il/resident-service/arnona/switching/",
    note: "Факс 04-8356035.",
    // Named on the city's arnona page; we couldn't open its own site.
    water: { names: { he: "מי כרמל", ru: "Мей Кармель", en: "Mei Carmel", ar: "مي كرمل" }, url: "" }
  },
  {
    key: "rishon",
    names: { he: "ראשון לציון", ru: "Ришон-ле-Цион", en: "Rishon LeZion", ar: "ريشون لتسيون" },
    method: "form", email: "",
    formUrl: "https://cityforms.co.il:60140/appbuilder/forms?code=8102005056A175301188E8CFFEF4DE61&Process=oneproc",
    source: "https://www.rishonlezion.muni.il/Residents/arnona/Pages/PropertyTaxRenting.aspx",
    note: "",
    water: { names: { he: "מניב ראשון", ru: "Маниб Ришон", en: "Maniv Rishon", ar: "منيف ريشون" }, url: "" }
  },
  {
    key: "petah-tikva",
    names: { he: "פתח תקווה", ru: "Петах-Тиква", en: "Petah Tikva", ar: "بيتح تكفا" },
    method: "email", email: "megurim@ptikva.org.il",
    formUrl: "https://por139.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=101&SUG=2",
    source: "https://www.petah-tikva.muni.il/arnona/ExchangeHolders",
    note: "Email жилого отдела для таких уведомлений. Факс 03-9052540.",
    water: { names: { he: "מיתב", ru: "Мейтав", en: "Meitav", ar: "ميتاف" }, url: "" }
  },
  {
    key: "ashdod",
    names: { he: "אשדוד", ru: "Ашдод", en: "Ashdod", ar: "أسدود" },
    method: "form", email: "",
    formUrl: "https://forms-ashdod.binaa.co.il/smartforms/28/",
    source: "https://digital.ashdod.muni.il/page/Gvia-ChangeRentPay-form",
    note: "",
    water: { names: { he: "יובלים אשדוד", ru: "Ювалим Ашдод", en: "Yuvalim Ashdod", ar: "يوفاليم أسدود" }, url: "" }
  },
  {
    key: "netanya",
    names: { he: "נתניה", ru: "Нетания", en: "Netanya", ar: "نتانيا" },
    method: "form", email: "",
    formUrl: "https://por138.cityforms.co.il/appbuilder/forms?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=101&SUG=1",
    source: "https://www.netanya.muni.il/Residents/Arnona/CustomerService/Pages/default.aspx",
    note: "Выезд: та же форма с SUG=5.",
    water: { names: { he: "מי נתניה", ru: "Мей Нетания", en: "Mei Netanya", ar: "مي نتانيا" }, url: "" }
  },
  {
    key: "beer-sheva",
    names: { he: "באר שבע", ru: "Беэр-Шева", en: "Beer Sheva", ar: "بئر السبع" },
    method: "email", email: "mokedg@br7.org.il",
    formUrl: "https://por162.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=B809005056B8060C11DD0B2422DCF607&Process=GVIYA_MAHZIKIM",
    source: "https://www.beer-sheva.muni.il/Residents/Arnona/Pages/HilufeiBealim.aspx",
    note: "",
    water: { names: { he: "מי שבע", ru: "Мей Шева", en: "Mei Sheva", ar: "مي شيفع" }, url: "" }
  },
  {
    key: "holon",
    names: { he: "חולון", ru: "Холон", en: "Holon", ar: "حولون" },
    method: "form", email: "",
    formUrl: "https://por134.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=8145005056A14F7F11CCD5B6BC7D267C&Process=ProcessOneClick&NOSE=1&TAT=101&SUG=7",
    source: "http://www.holon.muni.il/Residents/TaxesWater/Pages/default.aspx",
    note: "",
    water: { names: { he: "מי שקמה", ru: "Мей Шикма", en: "Mei Shikma", ar: "مي شيكما" }, url: "" }
  },
  {
    key: "bnei-brak",
    names: { he: "בני ברק", ru: "Бней-Брак", en: "Bnei Brak", ar: "بني براك" },
    method: "email", email: "gviya1@bbm.org.il",
    formUrl: "https://forms.bbm.org.il/%D7%A9%D7%99%D7%A0%D7%95%D7%99-%D7%9E%D7%97%D7%96%D7%99%D7%A7-%D7%91%D7%A0%D7%9B%D7%A1/",
    source: "https://www.bnei-brak.muni.il/%d7%a0%d7%95%d7%94%d7%9c-%d7%97%d7%99%d7%9c%d7%95%d7%a4%d7%99-%d7%9e%d7%97%d7%96%d7%99%d7%a7-%d7%91%d7%a0%d7%9b%d7%a1/",
    note: "Факс 03-5776211.",
    water: { names: { he: "מי ברק", ru: "Мей Брак", en: "Mei Brak", ar: "مي براك" }, url: "" }
  },
  {
    key: "ramat-gan",
    names: { he: "רמת גן", ru: "Рамат-Ган", en: "Ramat Gan", ar: "رمات غان" },
    method: "form", email: "",
    formUrl: "https://por759.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=1001&SUG=1",
    source: "https://www.ramat-gan.muni.il/department-money/content-pages/arnona-header/",
    note: "",
    water: { names: { he: "מי רמת גן", ru: "Мей Рамат-Ган", en: "Mei Ramat Gan", ar: "مي رمات غان" }, url: "" }
  },
  {
    key: "bat-yam",
    names: { he: "בת ים", ru: "Бат-Ям", en: "Bat Yam", ar: "بات يام" },
    method: "form", email: "",
    formUrl: "https://forms.milgam.co.il/bat-yam/forms/162/",
    source: "https://www.bat-yam.muni.il/he/122/",
    note: "",
    water: { names: { he: "מי בת ים", ru: "Мей Бат-Ям", en: "Mei Bat Yam", ar: "مي بات يام" }, url: "" }
  },
  {
    key: "rehovot",
    names: { he: "רחובות", ru: "Реховот", en: "Rehovot", ar: "رحوفوت" },
    method: "form", email: "",
    formUrl: "https://www.rehovot.muni.il/flowmateapp.php?name=%D7%94%D7%97%D7%9C%D7%A4%D7%94%20%D7%9E%D7%91%D7%A2%D7%9C%D7%99%D7%9D%20%D7%9C%D7%93%D7%99%D7%99%D7%A8%D7%99%D7%9D",
    source: "https://www.rehovot.muni.il/%D7%94%D7%97%D7%9C%D7%A4%D7%AA-%D7%9E%D7%97%D7%96%D7%99%D7%A7%D7%99%D7%9D-%D7%91%D7%A0%D7%9B%D7%A1/",
    note: "Отдельные формы: жилец→жилец, владелец→жилец, возврат владельцу.",
    water: { names: { he: "הבאר השלישית", ru: "А-Беэр а-Шлишит", en: "HaBeer HaShlishit", ar: "هبئير هشليشيت" }, url: "http://www.habeer3.co.il/122/" }
  },
  {
    key: "ashkelon",
    names: { he: "אשקלון", ru: "Ашкелон", en: "Ashkelon", ar: "عسقلان" },
    method: "form", email: "",
    formUrl: "https://por154.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick",
    source: "https://ashkelon.muni.gov.il/he/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D-%D7%9C%D7%AA%D7%95%D7%A9%D7%91/%D7%90%D7%A8%D7%A0%D7%95%D7%A0%D7%94",
    note: "Ссылка на список всех цифровых форм города — смену жильца выбрать в нём.",
    water: { names: { he: "מי אשקלון", ru: "Мей Ашкелон", en: "Mei Ashkelon", ar: "مي عسقلان" }, url: "" }
  },
  {
    key: "herzliya",
    names: { he: "הרצליה", ru: "Герцлия", en: "Herzliya", ar: "هرتسليا" },
    method: "form", email: "",
    formUrl: "https://por131.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=1001&SUG=1",
    source: "https://www.herzliya.muni.il/רישום-מחזיקים-בארנונה/",
    note: "Выезд: та же форма с SUG=10.",
    water: { names: { he: "מי הרצליה", ru: "Мей Герцлия", en: "Mei Herzliya", ar: "مي هرتسليا" }, url: "" }
  },
  {
    key: "kfar-saba",
    names: { he: "כפר סבא", ru: "Кфар-Саба", en: "Kfar Saba", ar: "كفار سابا" },
    method: "form", email: "",
    formUrl: "https://www.kfar-saba.muni.il/2987/",
    source: "https://www.kfar-saba.muni.il/חילופי-דיירים-בנכס/",
    note: "",
    water: { names: { he: "מפעל המים כפר סבא", ru: "Водоканал Кфар-Сабы", en: "Kfar Saba Water Works", ar: "مصلحة مياه كفار سابا" }, url: "https://www.kfar-saba.muni.il/2374/" }
  },
  {
    key: "hadera",
    names: { he: "חדרה", ru: "Хадера", en: "Hadera", ar: "الخضيرة" },
    method: "", email: "", formUrl: "",
    source: "https://www.hadera.muni.il/%d7%90%d7%92%d7%a4%d7%99%d7%9d-%d7%95%d7%9e%d7%97%d7%9c%d7%a7%d7%95%d7%aa/%d7%90%d7%92%d7%a3-%d7%94%d7%9b%d7%a1%d7%a4%d7%99%d7%9d/%d7%94%d7%9b%d7%a0%d7%a1%d7%95%d7%aa-%d7%95%d7%90%d7%a8%d7%a0%d7%95%d7%a0%d7%94/",
    note: "Ни формы, ни email для смены жильца; на странице отдела арноны только личные адреса сотрудников — туда не шлём. Уточнить по телефону 04-6303311.",
    water: { names: { he: "מי חדרה", ru: "Мей Хадера", en: "Mei Hadera", ar: "مي الخضيرة" }, url: "" }
  },
  {
    key: "modiin",
    names: { he: "מודיעין-מכבים-רעות", ru: "Модиин", en: "Modiin", ar: "موديعين" },
    method: "form", email: "",
    formUrl: "https://por256.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=31&TAT=3012&SUG=47",
    source: "https://www.modiin.muni.il/modiinwebsite/ArticlePage.aspx?PageID=1534_10972",
    note: "",
    water: { names: { he: "מי מודיעין", ru: "Мей Модиин", en: "Mei Modiin", ar: "مي موديعين" }, url: "" }
  },
  {
    key: "raanana",
    names: { he: "רעננה", ru: "Раанана", en: "Raanana", ar: "رعنانا" },
    method: "email", email: "misim@raanana.muni.il",
    formUrl: "https://por176.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick",
    source: "https://www.raanana.muni.il/residents/arnona/propertyexchange/",
    note: "Email указан на странице смены жильца «для связи и согласования услуги». Факс 09-7610484.",
    water: { names: { he: "מי רעננה", ru: "Мей Раанана", en: "Mei Raanana", ar: "مي رعنانا" }, url: "" }
  },
  {
    key: "lod",
    names: { he: "לוד", ru: "Лод", en: "Lod", ar: "اللد" },
    method: "form", email: "",
    formUrl: "https://forms.mast.co.il/PayersReplacment/index?p=3E9B756E-232A-4BDB-8FC3-D6C2A00BB81A&t=2",
    source: "https://www.lod.muni.il/he/106/",
    note: "",
    water: { names: { he: "מי לוד", ru: "Мей Лод", en: "Mei Lod", ar: "مي اللد" }, url: "" }
  },
  {
    key: "ramla",
    names: { he: "רמלה", ru: "Рамле", en: "Ramla", ar: "الرملة" },
    method: "form", email: "",
    formUrl: "https://forms.milgam.co.il/ramle/forms/64/",
    source: "https://ramle.org.il/חילופי-דיירים-בנכס/",
    note: "",
    water: { names: { he: "ת.מ.ר – תאגיד המים רמלה", ru: "ТаМаР (водная компания Рамле)", en: "TAMAR Ramla Water", ar: "تمار – شركة مياه الرملة" }, url: "" }
  },
  {
    key: "nazareth",
    names: { he: "נצרת", ru: "Назарет", en: "Nazareth", ar: "الناصرة" },
    method: "", email: "",
    formUrl: "",
    source: "https://www.nazareth.muni.il/arabic/service/arnona/Pages/default.aspx",
    note: "На странице арноны только общий email отдела платежей (Paymnt.d@nazareth.muni.il), смена жильца не упомянута — письма туда не шлём.",
    water: { names: { he: "הרי נצרת", ru: "Харей Нацрат", en: "Harei Natzrat", ar: "هاري نتسرات" }, url: "" }
  },
  {
    key: "karmiel",
    names: { he: "כרמיאל", ru: "Кармиэль", en: "Karmiel", ar: "كرمئيل" },
    method: "email", email: "gvia@karmiel.muni.il",
    formUrl: "https://por193.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=101",
    source: "https://www.karmiel.muni.il/residents/arnonaservies/%d7%9e%d7%97%d7%9c%d7%a7%d7%aa-%d7%92%d7%91%d7%99%d7%99%d7%94/",
    note: "Общий email отдела взыскания; смена жильца указана среди его задач. Факс 04-9085629.",
    water: { names: { he: "עין כרמים", ru: "Эйн Кармим", en: "Ein Karmim", ar: "عين كرميم" }, url: "https://www.karmiel.muni.il/residents/mayimvebiyuv/" }
  },
  {
    key: "nahariya",
    names: { he: "נהריה", ru: "Нагария", en: "Nahariya", ar: "نهاريا" },
    method: "form", email: "",
    formUrl: "https://tiktak.metropolinet.co.il/#!form/220751975577468",
    source: "https://www.nahariya.muni.il/ארנונה-ומים/",
    note: "Это общая форма обращения по арноне, не специальная.",
    water: { names: { he: "מי נהריה", ru: "Мей Нагария", en: "Mei Nahariya", ar: "مي نهاريا" }, url: "" }
  },
  {
    key: "eilat",
    names: { he: "אילת", ru: "Эйлат", en: "Eilat", ar: "إيلات" },
    method: "form", email: "",
    formUrl: "https://por148.cityforms.co.il/ApplicationBuilder/eFormRender.html?code=81030050568A4D0111BB33BA9A6234DE&Process=ProcessOneClick&NOSE=1&TAT=1001&SUG=60",
    source: "https://eilat.muni.il/חילופי-מחזיק-או-בעלים-בנכס/",
    note: "",
    water: { names: { he: "עין נטפים", ru: "Эйн Нетафим", en: "Ein Netafim", ar: "عين نطافيم" }, url: "" }
  }
];

function findMunicipality(key) {
  return municipalities.find(m => m.key === key) || null;
}

module.exports = { municipalities, findMunicipality };
