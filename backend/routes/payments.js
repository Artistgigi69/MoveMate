const express = require("express");

const cardcom = require("../services/cardcom");
const CardcomSession = require("../models/CardcomSession");
const Card = require("../models/Card");
const Expense = require("../models/Expense");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const PREMIUM_PRICE = 19.9;
const PREMIUM_DAYS = 30;


// ================= START: ADD CARD (hosted tokenization) =================
// Card number/CVV are entered on Cardcom's page, never on ours.

router.post("/cardcom/add-card", verifyToken, async (req, res) => {

  try {

    if (!cardcom.isConfigured()) {
      return res.status(503).json({
        message: "Payment gateway not configured yet. Set CARDCOM_TERMINAL and CARDCOM_API_NAME."
      });
    }

    const backendBase = `${req.protocol}://${req.get("host")}`;

    const { url, lowProfileId } = await cardcom.createLowProfile({
      amount: 0,
      operation: "CreateTokenOnly",
      successUrl: `${FRONTEND_URL}/cards/callback?lowProfileId={LowProfileId}`,
      failedUrl: `${FRONTEND_URL}/cards/callback?lowProfileId={LowProfileId}&failed=1`,
      webHookUrl: `${backendBase}/payments/cardcom/webhook`,
      description: "Add payment card"
    });

    await CardcomSession.create({
      lowProfileId,
      userId: req.userId,
      purpose: "add-card"
    });

    res.json({ url });

  } catch (error) {

    console.log("CARDCOM ADD-CARD ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= START: PAY A UTILITY BILL =================
// If the user already has a saved card, charge the token directly (no
// redirect). Otherwise fall back to the hosted flow so they can enter a
// card and pay in one step.

router.post("/cardcom/pay", verifyToken, async (req, res) => {

  try {

    const { utilityType, amount, cardId } = req.body;

    if (!utilityType || !["electricity", "gas", "water", "arnona"].includes(utilityType)) {
      return res.status(400).json({
        message: "A valid utilityType is required"
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number"
      });
    }

    if (!cardcom.isConfigured()) {
      return res.status(503).json({
        message: "Payment gateway not configured yet. Set CARDCOM_TERMINAL and CARDCOM_API_NAME."
      });
    }

    if (cardId) {

      const card = await Card.findOne({ _id: cardId, userId: req.userId });

      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      const result = await cardcom.chargeWithToken({
        token: card.cardcomToken,
        amount: numericAmount,
        description: `${utilityType} bill`
      });

      const expense = await Expense.create({
        userId: req.userId,
        title: `${utilityType} payment`,
        amount: numericAmount,
        category: utilityType,
        description: `Paid with ${card.brand} •••• ${card.last4} (Cardcom #${result.transactionId})`
      });

      return res.json({ charged: true, expense });

    }

    // No saved card — go through the hosted page and charge + tokenize in one go.
    const backendBase = `${req.protocol}://${req.get("host")}`;

    const { url, lowProfileId } = await cardcom.createLowProfile({
      amount: numericAmount,
      operation: "ChargeAndCreateToken",
      successUrl: `${FRONTEND_URL}/cards/callback?lowProfileId={LowProfileId}`,
      failedUrl: `${FRONTEND_URL}/cards/callback?lowProfileId={LowProfileId}&failed=1`,
      webHookUrl: `${backendBase}/payments/cardcom/webhook`,
      description: `${utilityType} bill`
    });

    await CardcomSession.create({
      lowProfileId,
      userId: req.userId,
      purpose: "utility-payment",
      meta: { utilityType, amount: numericAmount }
    });

    res.json({ url });

  } catch (error) {

    console.log("CARDCOM PAY ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= START: UPGRADE TO PREMIUM =================
// One-time charge that grants PREMIUM_DAYS of premium — pay again anytime
// to extend. No recurring/standing-order billing wired up (Cardcom supports
// it, but it's a separate, heavier integration than this scaffold covers).

router.post("/cardcom/upgrade-premium", verifyToken, async (req, res) => {

  try {

    if (!cardcom.isConfigured()) {
      return res.status(503).json({
        message: "Payment gateway not configured yet. Set CARDCOM_TERMINAL and CARDCOM_API_NAME."
      });
    }

    const backendBase = `${req.protocol}://${req.get("host")}`;

    const { url, lowProfileId } = await cardcom.createLowProfile({
      amount: PREMIUM_PRICE,
      operation: "ChargeOnly",
      successUrl: `${FRONTEND_URL}/cards/callback?lowProfileId={LowProfileId}`,
      failedUrl: `${FRONTEND_URL}/cards/callback?lowProfileId={LowProfileId}&failed=1`,
      webHookUrl: `${backendBase}/payments/cardcom/webhook`,
      description: `MoveMate Premium — ${PREMIUM_DAYS} days`
    });

    await CardcomSession.create({
      lowProfileId,
      userId: req.userId,
      purpose: "upgrade-premium"
    });

    res.json({ url });

  } catch (error) {

    console.log("CARDCOM UPGRADE ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= FINALIZE A HOSTED-PAGE SESSION =================
// Called by the frontend's /cards/callback page right after the redirect
// back from Cardcom, so the UI can show a result immediately. Idempotent —
// safe to also be settled by the webhook below.

router.get("/cardcom/result/:lowProfileId", verifyToken, async (req, res) => {

  try {

    const session = await finalizeSession(req.params.lowProfileId, req.userId);

    res.json(session);

  } catch (error) {

    console.log("CARDCOM RESULT ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= WEBHOOK (server-to-server, no auth) =================

router.post("/cardcom/webhook", async (req, res) => {

  try {

    const lowProfileId = req.body.LowProfileId || req.body.lowProfileId || req.query.lowProfileId;

    if (lowProfileId) {
      await finalizeSession(lowProfileId);
    }

    res.sendStatus(200);

  } catch (error) {

    console.log("CARDCOM WEBHOOK ERROR:", error);

    // Cardcom retries on non-200, but we don't want to leak internal errors.
    res.sendStatus(200);

  }

});




// Shared finalize logic used by both the result endpoint and the webhook.
// `expectedUserId`, when given, refuses to hand back another user's session.
async function finalizeSession(lowProfileId, expectedUserId) {

  const session = await CardcomSession.findOne({ lowProfileId });

  if (!session) {
    throw new Error("Unknown Cardcom session");
  }

  if (expectedUserId && String(session.userId) !== String(expectedUserId)) {
    throw new Error("Session does not belong to this user");
  }

  if (session.status !== "pending") {
    return { status: session.status, purpose: session.purpose };
  }

  const result = await cardcom.getLowProfileResult(lowProfileId);

  if (!result.success) {
    session.status = "failed";
    await session.save();
    return { status: "failed", purpose: session.purpose };
  }

  if (session.purpose === "add-card") {

    await Card.create({
      userId: session.userId,
      cardHolder: result.cardHolder || "Card holder",
      last4: result.last4,
      brand: result.brand || "Card",
      expiry: result.expiry,
      cardcomToken: result.token
    });

  } else if (session.purpose === "utility-payment") {

    await Expense.create({
      userId: session.userId,
      title: `${session.meta.utilityType} payment`,
      amount: session.meta.amount,
      category: session.meta.utilityType,
      description: `Paid via Cardcom (#${result.transactionId})`
    });

    if (result.token) {
      await Card.create({
        userId: session.userId,
        cardHolder: result.cardHolder || "Card holder",
        last4: result.last4,
        brand: result.brand || "Card",
        expiry: result.expiry,
        cardcomToken: result.token
      });
    }

  } else if (session.purpose === "upgrade-premium") {

    const user = await User.findById(session.userId);

    const base = user.premiumUntil && user.premiumUntil > new Date()
      ? user.premiumUntil
      : new Date();

    user.plan = "premium";
    user.premiumUntil = new Date(base.getTime() + PREMIUM_DAYS * 24 * 60 * 60 * 1000);

    await user.save();

  }

  session.status = "completed";
  await session.save();

  return { status: "completed", purpose: session.purpose };
}


module.exports = router;
