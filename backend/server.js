console.log("SERVER STARTING 🚀");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

require("dotenv").config();

const { apiLimiter, authLimiter } = require("./middleware/rateLimiters");
const errorHandler = require("./middleware/errorHandler");
const alerts = require("./services/alerts");

const authRoutes = require("./routes/auth");
const transferRoutes = require("./routes/transfers");
const profileRoutes = require("./routes/profile");
const expenseRoutes = require("./routes/expenses");
const dashboardRoutes = require("./routes/dashboard");
const app = express();

const cardsRoutes = require("./routes/cards");
const paymentsRoutes = require("./routes/payments");
const checklistRoutes = require("./routes/checklist");
const pushRoutes = require("./routes/push");
const exportRoutes = require("./routes/export");
const supportRoutes = require("./routes/support");
const municipalityRoutes = require("./routes/municipalities");
const adminRoutes = require("./routes/admin");
const { checkMoveReminders } = require("./services/reminders");

const fileStore = require("./services/fileStore");


// ================== MIDDLEWARE ==================
app.use(helmet({
  // Uploaded avatars/meter photos are fetched cross-origin by the frontend
  // dev server (different port) — helmet's default same-origin CORP header
  // would silently block those <img> loads.
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Content-Disposition carries the original file name on lease downloads;
// cross-origin JS can't read it unless it's exposed.
app.use(cors({ exposedHeaders: ["Content-Disposition"] }));
app.use(alerts.middleware);
app.use(express.json());
app.use(apiLimiter);

// Public uploads (avatars, meter photos) live in MongoDB — see
// services/fileStore.js. Leases are not reachable here.
app.get("/uploads/:name", (req, res, next) => {
  fileStore.sendFile(res, "public", req.params.name).catch(next);
});


// ================== ROUTES ==================
app.use("/auth", authLimiter, authRoutes);
app.use("/transfers", transferRoutes);
app.use("/profile", profileRoutes);
app.use("/expenses", expenseRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/cards", cardsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/checklist", checklistRoutes);
app.use("/push", pushRoutes);
app.use("/export", exportRoutes);
app.use("/support", supportRoutes);
app.use("/municipalities", municipalityRoutes);
app.use("/admin", adminRoutes);

// ================== TEST ==================
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


// ================== ERROR HANDLER (must be last) ==================
app.use(errorHandler);


// ================== MONGODB ==================

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB connected");

  // Check for upcoming moves once at boot, then every hour.
  const reminders = () => checkMoveReminders().catch(err => {
    console.log("REMINDER CHECK ERROR:", err);
    alerts.notify("Move reminder check failed", err.stack || String(err));
  });
  reminders();
  setInterval(reminders, 60 * 60 * 1000);
})
.catch((err) => {
  console.log("❌ MongoDB ERROR:", err);
  alerts.notify("MongoDB connection failed", err.stack || String(err));
});

// Promises nobody awaited. Without this handler Node would exit and drop
// every request in flight; log, mail and keep serving instead.
process.on("unhandledRejection", err => {
  console.log("UNHANDLED REJECTION:", err);
  alerts.notify("Unhandled promise rejection", (err && err.stack) || String(err));
});
// ================== START ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${PORT} 🚀`);
});