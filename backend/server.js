console.log("SERVER STARTING 🚀");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const Transfer = require("./models/Transfer");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();


// ================== CREATE UPLOADS FOLDER ==================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}


// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));


// ================== MONGODB ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error:", err));


// ================== MULTER ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// ================== JWT ==================
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}


// ================== TEST ==================
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


// ================== REGISTER ==================
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User created" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== LOGIN ==================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.json({
      token,
      user: {
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== PROFILE ==================
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== UPLOAD AVATAR ==================
app.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = req.file.filename;
    await user.save();

    res.json({
      message: "Avatar uploaded",
      avatar: user.avatar
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== CREATE TRANSFER ==================
app.post("/transfers", verifyToken, async (req, res) => {
  try {
    const { oldAddress, newAddress, moveDate, services } = req.body;

    const transfer = await Transfer.create({
      userId: req.userId,
      oldAddress,
      newAddress,
      moveDate,
      services: services.map(s => ({
        name: s,
        status: "Pending"
      }))
    });

    res.json(transfer);

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// ================== GET ALL TRANSFERS ==================
app.get("/transfers", verifyToken, async (req, res) => {
  try {
    const transfers = await Transfer.find({
      userId: req.userId
    });

    res.json(transfers);

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// ================== GET ONE TRANSFER (FIX) ==================
app.get("/transfers/:id", verifyToken, async (req, res) => {
  try {
    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transfer) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(transfer);

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// ================== DELETE ==================
app.delete("/transfers/:id", verifyToken, async (req, res) => {
  try {
    const transfer = await Transfer.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transfer) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted" });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// ================== UPDATE STATUS ==================
app.put("/transfers/:id/status", verifyToken, async (req, res) => {
  try {
    const { serviceIndex, status } = req.body;

    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transfer) {
      return res.status(404).json({ message: "Not found" });
    }

    transfer.services[serviceIndex].status = status;

    await transfer.save();

    res.json(transfer);

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// ================== START ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${PORT} 🚀`);
});