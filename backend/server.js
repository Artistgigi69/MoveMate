console.log("SERVER STARTING 🚀");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");

require("dotenv").config();

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
const { checkMoveReminders } = require("./services/reminders");

// ================== CREATE UPLOADS FOLDER ==================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}


// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));


// ================== ROUTES ==================
app.use("/auth", authRoutes);
app.use("/transfers", transferRoutes);
app.use("/profile", profileRoutes);
app.use("/expenses", expenseRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/cards", cardsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/checklist", checklistRoutes);
app.use("/push", pushRoutes);
app.use("/export", exportRoutes);

// ================== TEST ==================
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


// ================== MONGODB ==================

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB connected");

  // Check for upcoming moves once at boot, then every hour.
  checkMoveReminders().catch(err => console.log("REMINDER CHECK ERROR:", err));
  setInterval(() => {
    checkMoveReminders().catch(err => console.log("REMINDER CHECK ERROR:", err));
  }, 60 * 60 * 1000);
})
.catch((err) => {
  console.log("❌ MongoDB ERROR:", err);
});
// ================== START ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${PORT} 🚀`);
});