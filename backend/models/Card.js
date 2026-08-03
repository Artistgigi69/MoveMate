const mongoose = require("mongoose");


const cardSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },


  cardHolder: {
    type: String,
    required: true
  },


  last4: {
    type: String,
    required: true
  },


  brand: {
    type: String,
    default: "Visa"
  },


  expiry: {
    type: String,
    required: true
  },


  isDefault: {
    type: Boolean,
    default: false
  },


  // Cardcom token for this card — used to charge it later without ever
  // touching raw card data again. The card number/CVV are entered on
  // Cardcom's hosted page and never reach this server.
  cardcomToken: {
    type: String,
    required: true
  }


}, {
  timestamps:true
});


module.exports = mongoose.model("Card", cardSchema);