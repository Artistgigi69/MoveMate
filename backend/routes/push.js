const express = require("express");

const PushSubscription = require("../models/PushSubscription");
const push = require("../services/push");
const verifyToken = require("../middleware/auth");

const router = express.Router();


// Public — the frontend needs this to call pushManager.subscribe()
router.get("/vapid-public-key", (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || null });
});


router.post("/subscribe", verifyToken, async (req, res) => {
  try {

    const { endpoint, keys } = req.body;

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId: req.userId, endpoint, keys },
      { upsert: true }
    );

    res.json({ message: "Subscribed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/unsubscribe", verifyToken, async (req, res) => {
  try {

    await PushSubscription.deleteOne({ endpoint: req.body.endpoint, userId: req.userId });

    res.json({ message: "Unsubscribed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Lets the user try it out from Settings without waiting for a real reminder.
router.post("/test", verifyToken, async (req, res) => {
  try {

    if (!push.isConfigured()) {
      return res.status(503).json({ message: "Push notifications are not configured" });
    }

    await push.sendPushToUser(req.userId, {
      title: "MoveMate",
      body: "Push notifications are working 🎉"
    });

    res.json({ message: "Sent" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
