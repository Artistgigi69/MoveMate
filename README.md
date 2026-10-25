# 🚚 MoveMate

MoveMate is a full-stack web application designed to simplify utility transfers when moving to a new apartment.

The application helps users manage electricity, gas, water and other service transfers in one place.

---

## 🚀 Features

- User registration and login
- JWT authentication
- Protected routes
- Password hashing with bcrypt
- User profile management
- Avatar upload
- Create utility transfer requests
- View all transfers
- Edit transfers
- Delete transfers
- Responsive user interface

---

## 🛠 Tech Stack

### Frontend

- React
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer

---

## 📂 Project Structure

```
backend/        Express API (MongoDB)
  data/         municipalities.js — arnona contacts per city, with sources
  routes/       auth, transfers, municipalities, …
  services/     mailer (SMTP), arnonaEmail (Hebrew letter), push, …
frontend/       original web app
frontend-v2/    new mobile-first app (RU / HE / AR / EN)
```

---

## 📱 frontend-v2

Mobile-first wizard: addresses → services → details (meter photos and
readings, new tenant, lease) → sign up at the end → submit → status.

- Four languages with right-to-left layout for Hebrew and Arabic
  (`src/i18n.jsx`).
- Arnona is emailed to the municipality when the city has an email in
  `backend/data/municipalities.js` and SMTP is configured; otherwise the
  status screen links to the city's online form.
- Electricity, gas and water show links to the provider's own page.
- The new tenant confirms meter readings from a shared link
  (`/confirm/:token`, no account needed).
- Leases are stored in `backend/private_uploads/` and only the owner can
  download them.

## ▶️ Running locally

```bash
cd backend
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm install
npm start              # http://localhost:5000
```

```bash
cd frontend-v2
npm install
npm run dev            # http://localhost:5174, /api is proxied to :5000
```

For a production build of frontend-v2, set `VITE_API_URL` to the API's
address before `npm run build`.

## ⚠️ Before going live

- Re-check the contacts in `backend/data/municipalities.js` against each
  `source` link; some cities are still empty.
- Send the first arnona letters to your own address to review them.
- Have a native speaker review the Hebrew and Arabic texts.
