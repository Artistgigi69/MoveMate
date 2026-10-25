// Password reset letter in the language the user was using on the site.

const TEXTS = {
  ru: {
    subject: "MoveMate: восстановление пароля",
    body: (name, url) => [
      `Здравствуйте${name ? ", " + name : ""}!`,
      "",
      "Мы получили запрос на смену пароля в MoveMate. Чтобы задать новый пароль, откройте ссылку:",
      url,
      "",
      "Ссылка действует 1 час. Если вы не запрашивали смену пароля, просто проигнорируйте это письмо — пароль останется прежним."
    ]
  },
  he: {
    subject: "MoveMate: איפוס סיסמה",
    body: (name, url) => [
      `שלום${name ? " " + name : ""},`,
      "",
      "קיבלנו בקשה לשינוי הסיסמה ב-MoveMate. כדי לבחור סיסמה חדשה, פתחו את הקישור:",
      url,
      "",
      "הקישור תקף לשעה אחת. אם לא ביקשתם לשנות את הסיסמה, אפשר להתעלם מהמכתב — הסיסמה לא תשתנה."
    ]
  },
  ar: {
    subject: "MoveMate: استعادة كلمة المرور",
    body: (name, url) => [
      `مرحبًا${name ? " " + name : ""}،`,
      "",
      "تلقّينا طلبًا لتغيير كلمة المرور في MoveMate. لتعيين كلمة مرور جديدة، افتح الرابط:",
      url,
      "",
      "الرابط صالح لمدة ساعة واحدة. إذا لم تطلب تغيير كلمة المرور، تجاهل هذه الرسالة — ستبقى كلمة المرور كما هي."
    ]
  },
  en: {
    subject: "MoveMate: reset your password",
    body: (name, url) => [
      `Hi${name ? " " + name : ""},`,
      "",
      "We received a request to change your MoveMate password. To choose a new one, open this link:",
      url,
      "",
      "The link is valid for 1 hour. If you didn't ask for this, just ignore this email — your password stays the same."
    ]
  }
};

function buildResetEmail({ name, url, lang }) {
  const t = TEXTS[lang] || TEXTS.en;
  return { subject: t.subject, text: t.body(name, url).join("\n") };
}

module.exports = { buildResetEmail };
