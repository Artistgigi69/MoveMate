const express = require("express");

const ChecklistItem = require("../models/ChecklistItem");
const verifyToken = require("../middleware/auth");

const router = express.Router();

const DEFAULT_ITEMS = [
  "Set up internet at the new address",
  "Forward your mail",
  "Update your address at Misrad HaPnim",
  "Update address with your bank",
  "Notify your employer / school",
  "Transfer or cancel subscriptions"
];


// ================== GET CHECKLIST (seeds defaults on first visit) ==================
router.get("/", verifyToken, async (req, res) => {
  try {

    let items = await ChecklistItem.find({ userId: req.userId }).sort({ createdAt: 1 });

    if (items.length === 0) {
      items = await ChecklistItem.insertMany(
        DEFAULT_ITEMS.map(title => ({ userId: req.userId, title }))
      );
    }

    res.json(items);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== ADD ITEM ==================
router.post("/", verifyToken, async (req, res) => {
  try {

    const item = await ChecklistItem.create({
      userId: req.userId,
      title: req.body.title
    });

    res.json(item);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== TOGGLE / RENAME ==================
router.put("/:id", verifyToken, async (req, res) => {
  try {

    const item = await ChecklistItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(item);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== DELETE ==================
router.delete("/:id", verifyToken, async (req, res) => {
  try {

    await ChecklistItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    res.json({ message: "Deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
