const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    avatar: {
        type: String,
        default: ""
    },

    twoFactorSecret: {
        type: String,
        default: ""
    },

    twoFactorEnabled: {
        type: Boolean,
        default: false
    },

    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },

    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    plan: {
        type: String,
        enum: ["free", "premium"],
        default: "free"
    },

    premiumUntil: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});


module.exports = mongoose.model("User", userSchema);