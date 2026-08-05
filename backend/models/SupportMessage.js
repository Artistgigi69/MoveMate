const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["open", "resolved"],
    default: "open"
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("SupportMessage", supportMessageSchema);
