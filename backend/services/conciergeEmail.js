// "Do it for me" emails: to staff when a request comes in, and to the user
// when staff finish it (done or failed), in the language the user was using.

const SERVICES = {
  ru: { electricity: "Электричество", water: "Вода", gas: "Газ", arnona: "Арнона", internet: "Интернет" },
  he: { electricity: "חשמל", water: "מים", gas: "גז", arnona: "ארנונה", internet: "אינטרנט" },
  ar: { electricity: "الكهرباء", water: "الماء", gas: "الغاز", arnona: "الأرنونا", internet: "الإنترنت" },
  en: { electricity: "Electricity", water: "Water", gas: "Gas", arnona: "Arnona", internet: "Internet" }
};

const TEXTS = {
  ru: {
    Completed: s => `MoveMate: ${s} — переоформлено`,
    Failed: s => `MoveMate: ${s} — не получилось переоформить`,
    body: (status, s, note, url) => [
      "Здравствуйте!",
      "",
      status === "Completed"
        ? `Мы переоформили «${s}» по вашей заявке.`
        : `К сожалению, переоформить «${s}» за вас не получилось. Это нужно будет сделать самостоятельно — ссылки и подсказки есть на странице заявки.`,
      ...(note ? ["", `Комментарий: ${note}`] : []),
      "",
      `Заявка: ${url}`
    ]
  },
  he: {
    Completed: s => `MoveMate: ${s} — הועבר`,
    Failed: s => `MoveMate: ${s} — לא הצלחנו להעביר`,
    body: (status, s, note, url) => [
      "שלום,",
      "",
      status === "Completed"
        ? `העברנו את "${s}" לפי הבקשה שלכם.`
        : `לצערנו לא הצלחנו להעביר את "${s}" בשבילכם. יש לעשות זאת בעצמכם — קישורים והסברים נמצאים בדף הבקשה.`,
      ...(note ? ["", `הערה: ${note}`] : []),
      "",
      `הבקשה: ${url}`
    ]
  },
  ar: {
    Completed: s => `MoveMate: ${s} — تم النقل`,
    Failed: s => `MoveMate: ${s} — لم نتمكن من النقل`,
    body: (status, s, note, url) => [
      "مرحبًا،",
      "",
      status === "Completed"
        ? `نقلنا «${s}» حسب طلبك.`
        : `للأسف لم نتمكن من نقل «${s}» نيابةً عنك. عليك القيام بذلك بنفسك — الروابط والإرشادات في صفحة الطلب.`,
      ...(note ? ["", `ملاحظة: ${note}`] : []),
      "",
      `الطلب: ${url}`
    ]
  },
  en: {
    Completed: s => `MoveMate: ${s} — transferred`,
    Failed: s => `MoveMate: ${s} — we couldn't transfer it`,
    body: (status, s, note, url) => [
      "Hi,",
      "",
      status === "Completed"
        ? `We've transferred "${s}" as you asked.`
        : `Unfortunately we couldn't transfer "${s}" for you. You'll need to do it yourself — the request page has links and tips.`,
      ...(note ? ["", `Note: ${note}`] : []),
      "",
      `Your request: ${url}`
    ]
  }
};

// status is "Completed" or "Failed".
function buildConciergeUpdate({ lang, service, status, note, url }) {
  const t = TEXTS[lang] ? lang : "en";
  const name = SERVICES[t][service] || service;
  return {
    subject: TEXTS[t][status](name),
    text: TEXTS[t].body(status, name, note, url).join("\n")
  };
}

// To staff. No ID numbers or phones: those stay behind the admin login.
function buildConciergeRequest({ service, oldCity, newCity, moveDate, url }) {
  const name = SERVICES.ru[service] || service;
  return {
    subject: `[MoveMate] Новая заявка «сделайте за меня»: ${name}`,
    text: [
      `Услуга: ${name}`,
      `Откуда / куда: ${oldCity || "?"} → ${newCity || "?"}`,
      `Дата переезда: ${moveDate}`,
      "",
      `Открыть заявки: ${url}`
    ].join("\n")
  };
}

module.exports = { buildConciergeUpdate, buildConciergeRequest };
