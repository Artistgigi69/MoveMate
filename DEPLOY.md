# Запуск MoveMate в интернете

Схема: **MongoDB Atlas** (база) → **Render** (бэкенд, `backend/`) → **Vercel**
(сайт, `frontend-v2/`). Письма (арнона, восстановление пароля) уходят через **Brevo**.

Порядок важен: база → почта → бэкенд → сайт → адрес сайта обратно в бэкенд.

Пароли и ключи никуда не пересылайте и не коммитьте — вписывайте их только в
настройки Render и в свой локальный `backend/.env`.

---

## 1. База: MongoDB Atlas

1. https://cloud.mongodb.com → **Create** → тариф **M0 (Free)** → регион
   поближе (например, Frankfurt) → **Create Deployment**.
2. Создайте пользователя базы (Database User): имя и пароль. Сохраните пароль
   у себя.
3. **Network Access → Add IP Address → Allow access from anywhere**
   (`0.0.0.0/0`). У Render на обычных тарифах нет постоянного IP-адреса.
4. **Connect → Drivers** → скопируйте строку вида
   `mongodb+srv://ИМЯ:<db_password>@cluster0.xxxxx.mongodb.net/`
   и допишите имя базы перед `?`: `.../movemate?retryWrites=true&w=majority`.
   Вместо `<db_password>` — пароль из шага 2.

Это значение `MONGO_URI`. Его же впишите в локальный `backend/.env`, если хотите
работать с этой базой с компьютера.

## 2. Почта: Brevo

1. Зарегистрируйтесь на https://www.brevo.com (тариф Free — 300 писем в день).
2. Подтвердите телефон (Brevo не отправляет письма без этого).
3. **Senders, domains, IPs → Senders → Add a sender**: `MoveMate` и адрес,
   с которого пойдут письма; подтвердите его по письму от Brevo.
4. **SMTP & API → SMTP → Generate a new SMTP key**. Ключ показывают один раз —
   сохраните его у себя. Кнопку «Activate for SMTP keys» (блокировка по IP) не
   включайте: у Render нет постоянного IP.

Значения: `SMTP_USER` = **Login** со страницы SMTP (вида `xxxx@smtp-brevo.com`),
`SMTP_PASS` = SMTP-ключ, `SMTP_FROM` = `MoveMate <подтверждённый адрес>`.
Сервер и порт (`smtp-relay.brevo.com`, 587) уже прописаны в `render.yaml`.

С адресом на gmail.com часть писем может попадать в спам. Для надёжной доставки
подключите свой домен в Brevo (**Senders, domains, IPs → Domains**).

**Перед запуском** временно поменяйте email одного города в
`backend/data/municipalities.js` на свой, оформите тестовую заявку и
посмотрите, как выглядит письмо. Потом верните адрес.

## 3. Бэкенд: Render

1. https://render.com → войти через GitHub.
2. **New → Blueprint** → репозиторий `Artistgigi69/MoveMate` → ветка
   (`master` после слияния PR) → Render прочитает `render.yaml`.
3. Он спросит значения: `MONGO_URI`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
   `JWT_SECRET` создастся сам.
4. **Apply**. Через пару минут появится адрес вида
   `https://movemate-api.onrender.com`. Проверка: открыть его — должно быть
   «Server is running».

**Стоимость:** в `render.yaml` бесплатный тариф. Карта не нужна. Минус: сервер
засыпает через 15 минут без посетителей, и первый запрос после этого ждёт до
минуты. Фото счётчиков и договоры хранятся в базе Atlas, поэтому не пропадают.

Когда появятся посетители: в `render.yaml` поменять `plan: free` на
`plan: starter` (~7 $/мес) — сервер перестанет засыпать. Больше ничего менять
не нужно. Бесплатная база Atlas вмещает 512 МБ — это несколько сотен заявок с
фото; потом её тоже можно перевести на платный тариф.

## 4. Сайт: Vercel

1. https://vercel.com → войти через GitHub → **Add New → Project** →
   `Artistgigi69/MoveMate`.
2. **Root Directory:** `frontend-v2`. Framework определится сам (Vite).
3. **Environment Variables:** `VITE_API_URL` = адрес бэкенда из шага 3, без `/`
   в конце.
4. **Deploy** → адрес вида `https://movemate.vercel.app`.

`frontend-v2/vercel.json` уже настроен так, что прямые ссылки (`/status/…`,
`/confirm/…` для нового жильца) открываются правильно.

## 5. Связать

В Render → сервис → **Environment** → добавьте `FRONTEND_URL` = адрес сайта из
шага 4 → **Save** (сервис перезапустится).

## 6. Резервные копии базы

У бесплатной базы Atlas резервных копий нет. Их каждую ночь делает GitHub
(`.github/workflows/backup.yml`) и хранит 30 дней. Репозиторий публичный,
поэтому копия зашифрована паролем, без него файл бесполезен.

Настройка (один раз): GitHub → репозиторий → **Settings → Secrets and
variables → Actions → New repository secret**, два секрета:

- `MONGO_URI` — та же строка, что в Render;
- `BACKUP_PASSPHRASE` — длинный случайный пароль. **Сохраните его в менеджере
  паролей**: без него копию не открыть.

Проверка: **Actions → Database backup → Run workflow**. Через минуту-две
у запуска появится файл `movemate-db-N`.

Восстановление (нужны `gpg` и MongoDB Database Tools):

```bash
gpg -d movemate.archive.gpg > db.archive
mongorestore --uri="<строка подключения>" --archive=db.archive --gzip
```

Если в репозитории 60 дней не было коммитов, GitHub отключает расписание. Тогда
включите его снова в **Actions → Database backup**.

## Проверка после запуска

- [ ] Открыть сайт с телефона, пройти заявку до конца с тестовыми данными.
- [ ] Ссылка для нового жильца открывается с другого телефона.
- [ ] Договор скачивается в «Мои заявки» и **не** открывается по прямой
      ссылке `/uploads/...`.
- [ ] Тестовое письмо по арноне пришло на ваш ящик (см. шаг 2).
- [ ] После повторного деплоя в Render загруженные фото на месте.
