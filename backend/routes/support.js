const express = require("express");

const SupportMessage = require("../models/SupportMessage");
const verifyToken = require("../middleware/auth");

const router = express.Router();


// ================== SUBMIT A MESSAGE ==================
router.post("/", verifyToken, async (req, res) => {
  try {

    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required"
      });
    }

    const ticket = await SupportMessage.create({
      userId: req.userId,
      subject,
      message
    });

    res.json(ticket);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== MY MESSAGES ==================
router.get("/", verifyToken, async (req, res) => {
  try {

    const tickets = await SupportMessage.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json(tickets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
