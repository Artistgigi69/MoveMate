const mongoose = require("mongoose");

// Bridges Cardcom's hosted-page redirect back to "which user/what was this
// for" — Cardcom's webhook call has no auth token, so we look the session up
// by the LowProfileId it hands back to us.
const cardcomSessionSchema = new mongoose.Schema({

  lowProfileId: {
    type: String,
    required: true,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  purpose: {
    type: String,
    enum: ["add-card", "utility-payment", "upgrade-premium"],
    required: true
  },

  meta: {
    utilityType: String,
    amount: Number
  },

  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("CardcomSession", cardcomSessionSchema);
