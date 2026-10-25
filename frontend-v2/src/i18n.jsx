import { createContext, useContext, useEffect, useState } from "react";

// Three languages, no library: a flat key → string table per language.
// "{name}" placeholders are filled from the vars passed to t().

export const LANGS = [
  { key: "ru", label: "RU" },
  { key: "he", label: "עב" },
  { key: "ar", label: "عر" },
  { key: "en", label: "EN" }
];

const RTL = ["he", "ar"];

const DICT = {
  ru: {
    "common.next": "Дальше",
    "common.back": "Назад",
    "common.myRequests": "Мои заявки",
    "common.choose": "— выберите —",
    "common.loading": "Загружаем…",
    "common.tapToChoose": "Нажмите, чтобы выбрать",
    "common.language": "Язык",

    "step.addresses": "Адреса",
    "step.services": "Услуги",
    "step.details": "Данные",
    "step.auth": "Вход",
    "step.submit": "Отправка",
    "step.of": "Шаг {n} из {total} · {name}",

    "service.electricity": "Электричество",
    "service.water": "Вода",
    "service.gas": "Газ",
    "service.arnona": "Арнона",
    "service.internet": "Интернет",

    "person.name": "Имя и фамилия",
    "person.idNumber": "Теудат зеут",
    "person.idHint": "9 цифр, включая контрольную",
    "person.phone": "Телефон",
    "person.email": "Email",

    "err.name": "Введите имя и фамилию",
    "err.id": "Неверный номер теудат зеут",
    "err.phone": "Неверный номер телефона",
    "err.email": "Неверный email",
    "err.digits": "Только цифры",
    "err.city": "Выберите город",
    "err.address": "Введите улицу, дом и квартиру",
    "err.date": "Укажите дату",
    "err.services": "Выберите хотя бы одну услугу",

    "home.title": "Переезжаете? Переоформим коммуналку за вас",
    "home.lead": "Один раз заполните адреса и данные — мы подготовим и отправим заявки. Регистрация понадобится только в конце.",
    "home.how1": "Старый и новый адрес, дата переезда",
    "home.how2": "Какие услуги переоформить",
    "home.how3": "Ваши данные, фото счётчиков, договор",
    "home.how4": "Отправка и отслеживание статуса",
    "home.start": "Начать",
    "home.continue": "Продолжить",
    "home.restart": "Начать заново",

    "addr.title": "Откуда и куда переезжаете?",
    "addr.old": "Старая квартира",
    "addr.new": "Новая квартира",
    "addr.city": "Город",
    "addr.address": "Адрес",
    "addr.addressPh": "Улица, дом, квартира",
    "addr.date": "Дата переезда",
    "addr.citiesFailed": "Не удалось загрузить список городов — проверьте, что сервер запущен.",

    "svc.title": "Что переоформить?",
    "svc.selectAll": "Выбрать всё",

    "det.title": "Данные для заявок",
    "det.you": "Ваши данные",
    "det.meters": "Счётчики на старой квартире",
    "det.metersNote": "Сфотографируйте счётчик в день переезда так, чтобы были видны цифры и номер.",
    "det.gasCompany": "Газовая компания",
    "det.gasHint": "Указана на баллоне или в счёте за газ",
    "det.reading": "Показания",
    "det.meterPhoto": "Фото счётчика",
    "det.tenant": "Новый жилец или хозяин старой квартиры",
    "det.tenantNote": "Нужен, чтобы счета перевели на него. Можно пропустить, если не знаете.",
    "det.lease": "Договор аренды",
    "det.leaseCopy": "Копия договора",

    "auth.titleRegister": "Создайте аккаунт",
    "auth.titleLogin": "Вход",
    "auth.note": "Аккаунт нужен, чтобы сохранить заявки и показывать их статус.",
    "auth.code": "Код из приложения-аутентификатора",
    "auth.name": "Имя",
    "auth.password": "Пароль",
    "auth.passwordHint": "Минимум 6 символов",
    "auth.wait": "Подождите…",
    "auth.confirm": "Подтвердить",
    "auth.createContinue": "Создать и продолжить",
    "auth.loginContinue": "Войти и продолжить",
    "auth.haveAccount": "Уже есть аккаунт? Войти",
    "auth.noAccount": "Нет аккаунта? Зарегистрироваться",

    "sub.title": "Проверьте и отправьте",
    "sub.from": "Откуда",
    "sub.to": "Куда",
    "sub.date": "Дата",
    "sub.applicant": "Заявитель",
    "sub.tenant": "Новый жилец",
    "sub.lease": "Договор",
    "sub.leaseNone": "не приложен",
    "sub.reading": "показания {value}",
    "sub.photo": "фото ✓",
    "sub.note": "Арнону отправим письмом в муниципалитет, если для вашего города есть адрес. Для остального на следующем экране будут ссылки, где переоформить самому.",
    "sub.send": "Отправить заявки",
    "sub.retry": "Повторить отправку",
    "sub.creating": "Создаём заявку…",
    "sub.uploadingPhoto": "Загружаем фото: {service}…",
    "sub.uploadingLease": "Загружаем договор…",
    "sub.sending": "Отправляем заявки…",

    "st.listTitle": "Мои заявки",
    "st.newMove": "Новый переезд",
    "st.empty": "Заявок пока нет.",
    "st.logout": "Выйти",
    "st.detailTitle": "Статус заявки",
    "st.downloadLease": "Скачать договор",
    "st.markedSelf": "Вы отметили, что связались сами",
    "st.iContacted": "Я уже связался",
    "st.reading": "Показания: {value}",
    "st.tenantConfirmed": "Новый жилец подтвердил показания",
    "st.oldFlat": "старая квартира",
    "st.newFlat": "новая квартира",
    "st.arnonaForm": "Форма арноны: {city} ({end})",
    "st.changeCustomer": "Смена клиента: {name}",
    "st.gasCall": "Позвоните в газовую компанию, указанную на баллоне или в счёте",
    "st.waterHint": "Водная компания указана в вашем счёте за воду",
    "st.tenantLink": "Попросите нового жильца подтвердить показания:",
    "st.copy": "Скопировать ссылку",
    "st.copied": "Ссылка скопирована",
    "st.whatsapp": "Отправить в WhatsApp",
    "st.shareText": "Здравствуйте! Подтвердите, пожалуйста, показания счётчика ({service}) при переезде: {url}",

    "status.Pending": "Ожидает",
    "status.Processing": "В обработке",
    "status.Completed": "Готово",

    "sentVia.email": "Отправлено письмом",
    "sentVia.auto": "Отправлено через онлайн-форму",
    "sentVia.manual": "Нужно связаться самостоятельно",

    "provider.iec": "Хеврат Хашмаль (IEC)",
    "gas.amisragas": "Амисрагаз",
    "gas.supergas": "Супергаз",
    "gas.pazgas": "Пазгаз",
    "gas.doralon": "Дор Алон",
    "gas.other": "Другая / не знаю",

    "confirm.title": "Подтверждение показаний",
    "confirm.lead": "{name} переезжает из квартиры по адресу {address} и просит подтвердить показания счётчика ({service}) на день передачи квартиры.",
    "confirm.leadNoName": "Прежний жилец квартиры по адресу {address} просит подтвердить показания счётчика ({service}) на день передачи квартиры.",
    "confirm.reading": "Показания",
    "confirm.photo": "Фото счётчика",
    "confirm.check": "Сверьте с самим счётчиком. Подтверждайте, только если цифры совпадают.",
    "confirm.button": "Подтверждаю показания",
    "confirm.done": "Спасибо! Показания подтверждены.",
    "confirm.notFound": "Ссылка недействительна или устарела.",

    "srv.network": "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.",
    "srv.generic": "Ошибка сервера",
    "srv.userNotFound": "Пользователь с таким email не найден",
    "srv.wrongPassword": "Неверный пароль",
    "srv.emailTaken": "Аккаунт с таким email уже существует",
    "srv.badEmail": "Введите корректный email",
    "srv.shortPassword": "Пароль должен быть не короче 6 символов",
    "srv.shortName": "Имя должно быть не короче 2 символов",
    "srv.tooMany": "Слишком много попыток, попробуйте позже",
    "srv.tooLarge": "Файл слишком большой (максимум 10 МБ)",
    "srv.badType": "Неподдерживаемый тип файла",
    "srv.leaseFailed": "Не удалось скачать договор",
    "srv.alreadyConfirmed": "Показания уже подтверждены"
  },

  he: {
    "common.next": "הבא",
    "common.back": "חזרה",
    "common.myRequests": "הבקשות שלי",
    "common.choose": "— בחרו —",
    "common.loading": "טוען…",
    "common.tapToChoose": "לחצו לבחירה",
    "common.language": "שפה",

    "step.addresses": "כתובות",
    "step.services": "שירותים",
    "step.details": "פרטים",
    "step.auth": "כניסה",
    "step.submit": "שליחה",
    "step.of": "שלב {n} מתוך {total} · {name}",

    "service.electricity": "חשמל",
    "service.water": "מים",
    "service.gas": "גז",
    "service.arnona": "ארנונה",
    "service.internet": "אינטרנט",

    "person.name": "שם מלא",
    "person.idNumber": "תעודת זהות",
    "person.idHint": "9 ספרות כולל ספרת ביקורת",
    "person.phone": "טלפון",
    "person.email": "דוא\"ל",

    "err.name": "הזינו שם מלא",
    "err.id": "מספר תעודת זהות לא תקין",
    "err.phone": "מספר טלפון לא תקין",
    "err.email": "כתובת דוא\"ל לא תקינה",
    "err.digits": "ספרות בלבד",
    "err.city": "בחרו עיר",
    "err.address": "הזינו רחוב, מספר בית ודירה",
    "err.date": "בחרו תאריך",
    "err.services": "בחרו לפחות שירות אחד",

    "home.title": "עוברים דירה? נעביר את החשבונות בשבילכם",
    "home.lead": "ממלאים פעם אחת כתובות ופרטים — ואנחנו מכינים ושולחים את הבקשות. הרשמה נדרשת רק בסוף.",
    "home.how1": "כתובת ישנה וחדשה, תאריך המעבר",
    "home.how2": "אילו שירותים להעביר",
    "home.how3": "הפרטים שלכם, צילומי מונים, חוזה",
    "home.how4": "שליחה ומעקב אחר הסטטוס",
    "home.start": "מתחילים",
    "home.continue": "להמשיך",
    "home.restart": "להתחיל מחדש",

    "addr.title": "מאיפה ולאן עוברים?",
    "addr.old": "הדירה הישנה",
    "addr.new": "הדירה החדשה",
    "addr.city": "עיר",
    "addr.address": "כתובת",
    "addr.addressPh": "רחוב, בית, דירה",
    "addr.date": "תאריך המעבר",
    "addr.citiesFailed": "לא הצלחנו לטעון את רשימת הערים — ודאו שהשרת פועל.",

    "svc.title": "מה להעביר?",
    "svc.selectAll": "לבחור הכול",

    "det.title": "פרטים לבקשות",
    "det.you": "הפרטים שלכם",
    "det.meters": "מונים בדירה הישנה",
    "det.metersNote": "צלמו את המונה ביום המעבר כך שהספרות והמספר שלו ייראו בבירור.",
    "det.gasCompany": "חברת הגז",
    "det.gasHint": "מופיעה על הבלון או בחשבון הגז",
    "det.reading": "קריאה",
    "det.meterPhoto": "צילום המונה",
    "det.tenant": "הדייר החדש או בעל הדירה הישנה",
    "det.tenantNote": "נדרש כדי להעביר אליו את החשבונות. אפשר לדלג אם לא ידוע.",
    "det.lease": "חוזה שכירות",
    "det.leaseCopy": "עותק החוזה",

    "auth.titleRegister": "יצירת חשבון",
    "auth.titleLogin": "כניסה",
    "auth.note": "החשבון נדרש כדי לשמור את הבקשות ולהציג את הסטטוס שלהן.",
    "auth.code": "קוד מאפליקציית האימות",
    "auth.name": "שם",
    "auth.password": "סיסמה",
    "auth.passwordHint": "לפחות 6 תווים",
    "auth.wait": "רגע…",
    "auth.confirm": "אישור",
    "auth.createContinue": "ליצור ולהמשיך",
    "auth.loginContinue": "להיכנס ולהמשיך",
    "auth.haveAccount": "כבר יש חשבון? כניסה",
    "auth.noAccount": "אין חשבון? הרשמה",

    "sub.title": "בדקו ושלחו",
    "sub.from": "מאיפה",
    "sub.to": "לאן",
    "sub.date": "תאריך",
    "sub.applicant": "המבקש/ת",
    "sub.tenant": "הדייר החדש",
    "sub.lease": "חוזה",
    "sub.leaseNone": "לא צורף",
    "sub.reading": "קריאה {value}",
    "sub.photo": "צילום ✓",
    "sub.note": "את הארנונה נשלח במייל לעירייה, אם יש לנו כתובת עבור העיר שלכם. לשאר השירותים יופיעו במסך הבא קישורים להעברה עצמית.",
    "sub.send": "שליחת הבקשות",
    "sub.retry": "לנסות שוב",
    "sub.creating": "יוצרים בקשה…",
    "sub.uploadingPhoto": "מעלים צילום: {service}…",
    "sub.uploadingLease": "מעלים את החוזה…",
    "sub.sending": "שולחים את הבקשות…",

    "st.listTitle": "הבקשות שלי",
    "st.newMove": "מעבר חדש",
    "st.empty": "אין עדיין בקשות.",
    "st.logout": "יציאה",
    "st.detailTitle": "סטטוס הבקשה",
    "st.downloadLease": "הורדת החוזה",
    "st.markedSelf": "סימנתם שפניתם בעצמכם",
    "st.iContacted": "כבר פניתי",
    "st.reading": "קריאה: {value}",
    "st.tenantConfirmed": "הדייר החדש אישר את הקריאה",
    "st.oldFlat": "הדירה הישנה",
    "st.newFlat": "הדירה החדשה",
    "st.arnonaForm": "טופס ארנונה: {city} ({end})",
    "st.changeCustomer": "החלפת לקוח: {name}",
    "st.gasCall": "התקשרו לחברת הגז שמופיעה על הבלון או בחשבון",
    "st.waterHint": "תאגיד המים מופיע בחשבון המים שלכם",
    "st.tenantLink": "בקשו מהדייר החדש לאשר את הקריאה:",
    "st.copy": "העתקת הקישור",
    "st.copied": "הקישור הועתק",
    "st.whatsapp": "שליחה בוואטסאפ",
    "st.shareText": "שלום! אנא אשרו את קריאת המונה ({service}) במעבר הדירה: {url}",

    "status.Pending": "ממתין",
    "status.Processing": "בטיפול",
    "status.Completed": "הושלם",

    "sentVia.email": "נשלח במייל",
    "sentVia.auto": "נשלח בטופס מקוון",
    "sentVia.manual": "יש לפנות בעצמכם",

    "provider.iec": "חברת החשמל",
    "gas.amisragas": "אמישראגז",
    "gas.supergas": "סופרגז",
    "gas.pazgas": "פזגז",
    "gas.doralon": "דור אלון",
    "gas.other": "אחרת / לא יודע",

    "confirm.title": "אישור קריאת מונה",
    "confirm.lead": "{name} עוזב/ת את הדירה בכתובת {address} ומבקש/ת לאשר את קריאת מונה ה{service} ביום מסירת הדירה.",
    "confirm.leadNoName": "הדייר הקודם בכתובת {address} מבקש לאשר את קריאת מונה ה{service} ביום מסירת הדירה.",
    "confirm.reading": "קריאה",
    "confirm.photo": "צילום המונה",
    "confirm.check": "השוו מול המונה עצמו. אשרו רק אם הספרות תואמות.",
    "confirm.button": "אני מאשר/ת את הקריאה",
    "confirm.done": "תודה! הקריאה אושרה.",
    "confirm.notFound": "הקישור אינו תקף או שפג תוקפו.",

    "srv.network": "אין חיבור לשרת. בדקו את האינטרנט ונסו שוב.",
    "srv.generic": "שגיאת שרת",
    "srv.userNotFound": "לא נמצא משתמש עם כתובת הדוא\"ל הזו",
    "srv.wrongPassword": "סיסמה שגויה",
    "srv.emailTaken": "כבר קיים חשבון עם כתובת הדוא\"ל הזו",
    "srv.badEmail": "הזינו כתובת דוא\"ל תקינה",
    "srv.shortPassword": "הסיסמה צריכה להכיל לפחות 6 תווים",
    "srv.shortName": "השם צריך להכיל לפחות 2 תווים",
    "srv.tooMany": "יותר מדי ניסיונות, נסו שוב מאוחר יותר",
    "srv.tooLarge": "הקובץ גדול מדי (עד 10MB)",
    "srv.badType": "סוג הקובץ אינו נתמך",
    "srv.leaseFailed": "לא הצלחנו להוריד את החוזה",
    "srv.alreadyConfirmed": "הקריאה כבר אושרה"
  },

  ar: {
    "common.next": "التالي",
    "common.back": "رجوع",
    "common.myRequests": "طلباتي",
    "common.choose": "— اختر —",
    "common.loading": "جارٍ التحميل…",
    "common.tapToChoose": "اضغط للاختيار",
    "common.language": "اللغة",

    "step.addresses": "العناوين",
    "step.services": "الخدمات",
    "step.details": "التفاصيل",
    "step.auth": "الدخول",
    "step.submit": "الإرسال",
    "step.of": "الخطوة {n} من {total} · {name}",

    "service.electricity": "الكهرباء",
    "service.water": "المياه",
    "service.gas": "الغاز",
    "service.arnona": "الأرنونا",
    "service.internet": "الإنترنت",

    "person.name": "الاسم الكامل",
    "person.idNumber": "رقم الهوية",
    "person.idHint": "9 أرقام بما فيها رقم التحقق",
    "person.phone": "الهاتف",
    "person.email": "البريد الإلكتروني",

    "err.name": "أدخل الاسم الكامل",
    "err.id": "رقم الهوية غير صحيح",
    "err.phone": "رقم الهاتف غير صحيح",
    "err.email": "البريد الإلكتروني غير صحيح",
    "err.digits": "أرقام فقط",
    "err.city": "اختر المدينة",
    "err.address": "أدخل الشارع ورقم المبنى والشقة",
    "err.date": "اختر التاريخ",
    "err.services": "اختر خدمة واحدة على الأقل",

    "home.title": "تنتقل إلى بيت جديد؟ سننقل حساباتك نيابةً عنك",
    "home.lead": "املأ العناوين والتفاصيل مرة واحدة — ونحن نجهّز الطلبات ونرسلها. التسجيل مطلوب فقط في النهاية.",
    "home.how1": "العنوان القديم والجديد وتاريخ الانتقال",
    "home.how2": "أي خدمات تريد نقلها",
    "home.how3": "بياناتك، صور العدادات، عقد الإيجار",
    "home.how4": "الإرسال ومتابعة الحالة",
    "home.start": "ابدأ",
    "home.continue": "متابعة",
    "home.restart": "ابدأ من جديد",

    "addr.title": "من أين وإلى أين تنتقل؟",
    "addr.old": "الشقة القديمة",
    "addr.new": "الشقة الجديدة",
    "addr.city": "المدينة",
    "addr.address": "العنوان",
    "addr.addressPh": "الشارع، المبنى، الشقة",
    "addr.date": "تاريخ الانتقال",
    "addr.citiesFailed": "تعذّر تحميل قائمة المدن — تأكد من أن الخادم يعمل.",

    "svc.title": "ماذا ننقل؟",
    "svc.selectAll": "اختيار الكل",

    "det.title": "تفاصيل الطلبات",
    "det.you": "بياناتك",
    "det.meters": "العدادات في الشقة القديمة",
    "det.metersNote": "صوّر العداد يوم الانتقال بحيث تظهر الأرقام ورقم العداد بوضوح.",
    "det.gasCompany": "شركة الغاز",
    "det.gasHint": "مذكورة على أسطوانة الغاز أو في فاتورة الغاز",
    "det.reading": "القراءة",
    "det.meterPhoto": "صورة العداد",
    "det.tenant": "المستأجر الجديد أو مالك الشقة القديمة",
    "det.tenantNote": "مطلوب لنقل الحسابات إليه. يمكنك التخطي إذا كنت لا تعرف.",
    "det.lease": "عقد الإيجار",
    "det.leaseCopy": "نسخة من العقد",

    "auth.titleRegister": "إنشاء حساب",
    "auth.titleLogin": "الدخول",
    "auth.note": "الحساب ضروري لحفظ طلباتك وعرض حالتها.",
    "auth.code": "الرمز من تطبيق المصادقة",
    "auth.name": "الاسم",
    "auth.password": "كلمة المرور",
    "auth.passwordHint": "6 أحرف على الأقل",
    "auth.wait": "لحظة…",
    "auth.confirm": "تأكيد",
    "auth.createContinue": "إنشاء ومتابعة",
    "auth.loginContinue": "دخول ومتابعة",
    "auth.haveAccount": "لديك حساب؟ الدخول",
    "auth.noAccount": "ليس لديك حساب؟ التسجيل",

    "sub.title": "راجع وأرسل",
    "sub.from": "من",
    "sub.to": "إلى",
    "sub.date": "التاريخ",
    "sub.applicant": "مقدّم الطلب",
    "sub.tenant": "المستأجر الجديد",
    "sub.lease": "العقد",
    "sub.leaseNone": "غير مرفق",
    "sub.reading": "القراءة {value}",
    "sub.photo": "صورة ✓",
    "sub.note": "سنرسل طلب الأرنونا بالبريد الإلكتروني إلى البلدية إذا كان لدينا عنوان لمدينتك. لباقي الخدمات ستظهر في الشاشة التالية روابط لنقلها بنفسك.",
    "sub.send": "إرسال الطلبات",
    "sub.retry": "إعادة المحاولة",
    "sub.creating": "جارٍ إنشاء الطلب…",
    "sub.uploadingPhoto": "جارٍ رفع الصورة: {service}…",
    "sub.uploadingLease": "جارٍ رفع العقد…",
    "sub.sending": "جارٍ إرسال الطلبات…",

    "st.listTitle": "طلباتي",
    "st.newMove": "انتقال جديد",
    "st.empty": "لا توجد طلبات بعد.",
    "st.logout": "خروج",
    "st.detailTitle": "حالة الطلب",
    "st.downloadLease": "تنزيل العقد",
    "st.markedSelf": "أشرت إلى أنك تواصلت بنفسك",
    "st.iContacted": "تواصلت بالفعل",
    "st.reading": "القراءة: {value}",
    "st.tenantConfirmed": "أكّد المستأجر الجديد القراءة",
    "st.oldFlat": "الشقة القديمة",
    "st.newFlat": "الشقة الجديدة",
    "st.arnonaForm": "نموذج الأرنونا: {city} ({end})",
    "st.changeCustomer": "تغيير الزبون: {name}",
    "st.gasCall": "اتصل بشركة الغاز المذكورة على الأسطوانة أو في الفاتورة",
    "st.waterHint": "شركة المياه مذكورة في فاتورة المياه",
    "st.tenantLink": "اطلب من المستأجر الجديد تأكيد القراءة:",
    "st.copy": "نسخ الرابط",
    "st.copied": "تم نسخ الرابط",
    "st.whatsapp": "إرسال عبر واتساب",
    "st.shareText": "مرحبًا! يرجى تأكيد قراءة عداد {service} عند الانتقال: {url}",

    "status.Pending": "قيد الانتظار",
    "status.Processing": "قيد المعالجة",
    "status.Completed": "تم",

    "sentVia.email": "أُرسل بالبريد الإلكتروني",
    "sentVia.auto": "أُرسل عبر نموذج إلكتروني",
    "sentVia.manual": "عليك التواصل بنفسك",

    "provider.iec": "شركة الكهرباء الإسرائيلية",
    "gas.amisragas": "أميسراغاز",
    "gas.supergas": "سوبرغاز",
    "gas.pazgas": "بازغاز",
    "gas.doralon": "دور ألون",
    "gas.other": "شركة أخرى / لا أعرف",

    "confirm.title": "تأكيد قراءة العداد",
    "confirm.lead": "{name} ينتقل من الشقة في العنوان {address} ويطلب تأكيد قراءة عداد {service} يوم تسليم الشقة.",
    "confirm.leadNoName": "المستأجر السابق في العنوان {address} يطلب تأكيد قراءة عداد {service} يوم تسليم الشقة.",
    "confirm.reading": "القراءة",
    "confirm.photo": "صورة العداد",
    "confirm.check": "قارن مع العداد نفسه. أكّد فقط إذا كانت الأرقام متطابقة.",
    "confirm.button": "أؤكد القراءة",
    "confirm.done": "شكرًا! تم تأكيد القراءة.",
    "confirm.notFound": "الرابط غير صالح أو انتهت صلاحيته.",

    "srv.network": "لا يوجد اتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.",
    "srv.generic": "خطأ في الخادم",
    "srv.userNotFound": "لا يوجد حساب بهذا البريد الإلكتروني",
    "srv.wrongPassword": "كلمة المرور غير صحيحة",
    "srv.emailTaken": "يوجد حساب بهذا البريد الإلكتروني",
    "srv.badEmail": "أدخل بريدًا إلكترونيًا صحيحًا",
    "srv.shortPassword": "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
    "srv.shortName": "يجب أن يتكون الاسم من حرفين على الأقل",
    "srv.tooMany": "محاولات كثيرة جدًا، حاول لاحقًا",
    "srv.tooLarge": "الملف كبير جدًا (الحد الأقصى 10 ميغابايت)",
    "srv.badType": "نوع الملف غير مدعوم",
    "srv.leaseFailed": "تعذّر تنزيل العقد",
    "srv.alreadyConfirmed": "تم تأكيد القراءة مسبقًا"
  },

  en: {
    "common.next": "Next",
    "common.back": "Back",
    "common.myRequests": "My requests",
    "common.choose": "— choose —",
    "common.loading": "Loading…",
    "common.tapToChoose": "Tap to choose",
    "common.language": "Language",

    "step.addresses": "Addresses",
    "step.services": "Services",
    "step.details": "Details",
    "step.auth": "Sign in",
    "step.submit": "Submit",
    "step.of": "Step {n} of {total} · {name}",

    "service.electricity": "Electricity",
    "service.water": "Water",
    "service.gas": "Gas",
    "service.arnona": "Arnona",
    "service.internet": "Internet",

    "person.name": "Full name",
    "person.idNumber": "ID number (teudat zehut)",
    "person.idHint": "9 digits including the check digit",
    "person.phone": "Phone",
    "person.email": "Email",

    "err.name": "Enter your full name",
    "err.id": "Invalid ID number",
    "err.phone": "Invalid phone number",
    "err.email": "Invalid email",
    "err.digits": "Digits only",
    "err.city": "Choose a city",
    "err.address": "Enter street, building and apartment",
    "err.date": "Choose a date",
    "err.services": "Choose at least one service",

    "home.title": "Moving? We'll transfer your utilities for you",
    "home.lead": "Fill in the addresses and details once — we prepare and send the requests. You only sign up at the end.",
    "home.how1": "Old and new address, moving date",
    "home.how2": "Which services to transfer",
    "home.how3": "Your details, meter photos, lease",
    "home.how4": "Submit and track the status",
    "home.start": "Start",
    "home.continue": "Continue",
    "home.restart": "Start over",

    "addr.title": "Where are you moving from and to?",
    "addr.old": "Old apartment",
    "addr.new": "New apartment",
    "addr.city": "City",
    "addr.address": "Address",
    "addr.addressPh": "Street, building, apartment",
    "addr.date": "Moving date",
    "addr.citiesFailed": "Couldn't load the city list — check that the server is running.",

    "svc.title": "What should we transfer?",
    "svc.selectAll": "Select all",

    "det.title": "Details for the requests",
    "det.you": "Your details",
    "det.meters": "Meters at the old apartment",
    "det.metersNote": "Photograph each meter on moving day so the digits and its number are clearly visible.",
    "det.gasCompany": "Gas company",
    "det.gasHint": "Shown on the gas tank or on your gas bill",
    "det.reading": "Reading",
    "det.meterPhoto": "Meter photo",
    "det.tenant": "New tenant or owner of the old apartment",
    "det.tenantNote": "Needed to move the accounts to them. Skip it if you don't know.",
    "det.lease": "Lease",
    "det.leaseCopy": "Copy of the lease",

    "auth.titleRegister": "Create an account",
    "auth.titleLogin": "Sign in",
    "auth.note": "An account keeps your requests and shows their status.",
    "auth.code": "Code from your authenticator app",
    "auth.name": "Name",
    "auth.password": "Password",
    "auth.passwordHint": "At least 6 characters",
    "auth.wait": "Please wait…",
    "auth.confirm": "Confirm",
    "auth.createContinue": "Create and continue",
    "auth.loginContinue": "Sign in and continue",
    "auth.haveAccount": "Already have an account? Sign in",
    "auth.noAccount": "No account? Sign up",

    "sub.title": "Review and submit",
    "sub.from": "From",
    "sub.to": "To",
    "sub.date": "Date",
    "sub.applicant": "Applicant",
    "sub.tenant": "New tenant",
    "sub.lease": "Lease",
    "sub.leaseNone": "not attached",
    "sub.reading": "reading {value}",
    "sub.photo": "photo ✓",
    "sub.note": "We'll email the arnona request to the municipality if we have an address for your city. For the rest, the next screen links to where you can transfer it yourself.",
    "sub.send": "Submit requests",
    "sub.retry": "Try again",
    "sub.creating": "Creating the request…",
    "sub.uploadingPhoto": "Uploading photo: {service}…",
    "sub.uploadingLease": "Uploading the lease…",
    "sub.sending": "Sending the requests…",

    "st.listTitle": "My requests",
    "st.newMove": "New move",
    "st.empty": "No requests yet.",
    "st.logout": "Sign out",
    "st.detailTitle": "Request status",
    "st.downloadLease": "Download lease",
    "st.markedSelf": "You marked this as done yourself",
    "st.iContacted": "I've done it",
    "st.reading": "Reading: {value}",
    "st.tenantConfirmed": "The new tenant confirmed the reading",
    "st.oldFlat": "old apartment",
    "st.newFlat": "new apartment",
    "st.arnonaForm": "Arnona form: {city} ({end})",
    "st.changeCustomer": "Change of customer: {name}",
    "st.gasCall": "Call the gas company shown on the tank or your bill",
    "st.waterHint": "Your water company is shown on your water bill",
    "st.tenantLink": "Ask the new tenant to confirm the reading:",
    "st.copy": "Copy link",
    "st.copied": "Link copied",
    "st.whatsapp": "Send via WhatsApp",
    "st.shareText": "Hi! Please confirm the {service} meter reading for the move: {url}",

    "status.Pending": "Pending",
    "status.Processing": "In progress",
    "status.Completed": "Done",

    "sentVia.email": "Sent by email",
    "sentVia.auto": "Sent via online form",
    "sentVia.manual": "You need to contact them yourself",

    "provider.iec": "Israel Electric Corporation (IEC)",
    "gas.amisragas": "Amisragas",
    "gas.supergas": "Supergas",
    "gas.pazgas": "Pazgas",
    "gas.doralon": "Dor Alon",
    "gas.other": "Other / not sure",

    "confirm.title": "Confirm meter reading",
    "confirm.lead": "{name} is moving out of {address} and asks you to confirm the {service} meter reading on handover day.",
    "confirm.leadNoName": "The previous tenant at {address} asks you to confirm the {service} meter reading on handover day.",
    "confirm.reading": "Reading",
    "confirm.photo": "Meter photo",
    "confirm.check": "Compare with the meter itself. Confirm only if the digits match.",
    "confirm.button": "I confirm the reading",
    "confirm.done": "Thank you! The reading is confirmed.",
    "confirm.notFound": "This link is invalid or has expired.",

    "srv.network": "Can't reach the server. Check your connection and try again.",
    "srv.generic": "Server error",
    "srv.userNotFound": "No account with this email",
    "srv.wrongPassword": "Wrong password",
    "srv.emailTaken": "An account with this email already exists",
    "srv.badEmail": "Enter a valid email address",
    "srv.shortPassword": "Password must be at least 6 characters",
    "srv.shortName": "Name must be at least 2 characters",
    "srv.tooMany": "Too many attempts, please try again later",
    "srv.tooLarge": "File is too large (max 10 MB)",
    "srv.badType": "Unsupported file type",
    "srv.leaseFailed": "Couldn't download the lease",
    "srv.alreadyConfirmed": "The reading is already confirmed"
  }
};

// Backend messages are English; map the ones a user can hit to our keys.
const SERVER_MESSAGES = {
  "User not found": "srv.userNotFound",
  "Wrong password": "srv.wrongPassword",
  "An account with this email already exists": "srv.emailTaken",
  "Please enter a valid email address": "srv.badEmail",
  "Password must be at least 6 characters": "srv.shortPassword",
  "Name must be at least 2 characters": "srv.shortName",
  "Too many attempts, please try again later.": "srv.tooMany",
  "Too many requests, please slow down.": "srv.tooMany",
  "File is too large (max 10 MB)": "srv.tooLarge",
  "Unsupported file type": "srv.badType",
  "Already confirmed": "srv.alreadyConfirmed",
  "Applicant: invalid ID number": "err.id",
  "Applicant: invalid phone number": "err.phone",
  "Applicant: invalid email": "err.email"
};

const LANG_KEY = "mm2_lang";

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (DICT[saved]) return saved;
  } catch {
    // Storage blocked — fall through to the browser language.
  }
  const nav = (navigator.language || "").slice(0, 2);
  if (nav === "he" || nav === "iw") return "he";
  if (nav === "ru") return "ru";
  if (nav === "ar") return "ar";
  return "en";
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);
  const dir = RTL.includes(lang) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = next => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // Not persisted — fine.
    }
  };

  const t = (key, vars = {}) => {
    const s = DICT[lang][key] ?? DICT.en[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  };

  // Like t(), but vars may be React elements — used to wrap user-typed
  // text (names, addresses) in <bdi> so it doesn't scramble an RTL sentence.
  const tx = (key, vars = {}) => {
    const s = DICT[lang][key] ?? DICT.en[key] ?? key;
    return s.split(/(\{\w+\})/).map((part, i) => {
      const m = part.match(/^\{(\w+)\}$/);
      return m && m[1] in vars ? <bdi key={i}>{vars[m[1]]}</bdi> : part;
    });
  };

  // An Error from api.js → text in the current language.
  const errText = err => {
    if (err?.key) return t(err.key);
    const mapped = SERVER_MESSAGES[err?.message];
    return mapped ? t(mapped) : err?.message || t("srv.generic");
  };

  // City/water names come from the backend as { ru, he, en }.
  const pick = obj => (obj ? obj[lang] || obj.en || obj.ru || "" : "");

  return (
    <I18nContext.Provider value={{ lang, setLang, dir, t, tx, errText, pick }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
