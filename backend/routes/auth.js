const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticator } = require("otplib");

const User = require("../models/User");

const router = express.Router();


// ================== REGISTER ==================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, refCode } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    let referredBy = null;

    if (refCode) {
      const referrer = await User.findOne({ referralCode: refCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const user = new User({
      username,
      email,
      password: hashedPassword,
      referralCode: await generateReferralCode(username),
      referredBy
    });

    await user.save();

    res.json({ message: "User created" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Short, human-shareable code like "GIORGI4F2A" — retries on the rare
// collision instead of trusting a single random pass.
async function generateReferralCode(username) {

  const base = (username || "USER").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `${base}${suffix}`;

    const exists = await User.findOne({ referralCode: code });
    if (!exists) return code;
  }

  return `${base}${Date.now().toString(36).toUpperCase()}`;
}


// ================== LOGIN ==================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }


    if (user.twoFactorEnabled) {

      const tempToken = jwt.sign(
        { id: user._id, twoFA: true },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      return res.json({
        requires2FA: true,
        tempToken
      });

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
    res.status(500).json({
      message: error.message
    });
  }
});


// ================== VERIFY 2FA CODE (LOGIN) ==================
router.post("/2fa/verify-login", async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({
        message: "Missing token or code"
      });
    }

    let payload;

    try {
      payload = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        message: "Login session expired, please log in again"
      });
    }

    if (!payload.twoFA) {
      return res.status(400).json({
        message: "Invalid session"
      });
    }

    const user = await User.findById(payload.id);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        message: "Two-factor authentication is not enabled"
      });
    }

    const valid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!valid) {
      return res.status(400).json({
        message: "Invalid authentication code"
      });
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
    res.status(500).json({
      message: error.message
    });
  }
});


module.exports = router;