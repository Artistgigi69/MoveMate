// Cardcom "LowProfile" integration.
//
// Card data NEVER touches our backend: the customer enters their card on a
// page hosted by Cardcom (the URL returned by createLowProfile), Cardcom
// redirects back to us with a LowProfileId, and getLowProfileResult() fetches
// the outcome (masked card, token, transaction id) server-to-server.
//
// Requires CARDCOM_TERMINAL / CARDCOM_API_NAME in the environment. Without
// them every call rejects with a clear "not configured" error instead of
// silently failing, so the rest of the app keeps working while the real
// merchant account is pending.
//
// Endpoint paths/fields follow Cardcom's documented v11 LowProfile API as of
// this writing — re-check https://docs.cardcom.solutions before going live,
// payment provider APIs do change.

const BASE_URL = "https://secure.cardcom.solutions/api/v11";

function isConfigured() {
  return Boolean(process.env.CARDCOM_TERMINAL && process.env.CARDCOM_API_NAME);
}

function requireConfig() {
  if (!isConfigured()) {
    const error = new Error(
      "Cardcom is not configured. Set CARDCOM_TERMINAL and CARDCOM_API_NAME in the environment."
    );
    error.code = "CARDCOM_NOT_CONFIGURED";
    throw error;
  }
}

// Start a hosted-page session. Use CreateOnly to just tokenize a card for
// future charges (no money moves), or ChargeAndCreateToken to charge now
// and save the card for next time.
async function createLowProfile({
  amount,
  operation,
  successUrl,
  failedUrl,
  webHookUrl,
  description
}) {
  requireConfig();

  const res = await fetch(`${BASE_URL}/LowProfile/Create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TerminalNumber: process.env.CARDCOM_TERMINAL,
      ApiName: process.env.CARDCOM_API_NAME,
      Operation: operation || "ChargeAndCreateToken",
      Amount: amount,
      SuccessRedirectUrl: successUrl,
      FailedRedirectUrl: failedUrl,
      WebHookUrl: webHookUrl,
      ProductName: description || "MoveMate payment",
      ISOCoinId: 1 // ILS
    })
  });

  const data = await res.json();

  if (data.ResponseCode !== 0) {
    const error = new Error(data.Description || "Cardcom rejected the request");
    error.cardcom = data;
    throw error;
  }

  return {
    url: data.Url,
    lowProfileId: data.LowProfileId
  };
}

async function getLowProfileResult(lowProfileId) {
  requireConfig();

  const res = await fetch(`${BASE_URL}/LowProfile/GetLpResult`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TerminalNumber: process.env.CARDCOM_TERMINAL,
      ApiName: process.env.CARDCOM_API_NAME,
      LowProfileId: lowProfileId
    })
  });

  const data = await res.json();

  if (data.ResponseCode !== 0) {
    const error = new Error(data.Description || "Could not fetch Cardcom result");
    error.cardcom = data;
    throw error;
  }

  return {
    success: data.ResponseCode === 0 && data.TranzactionInfo?.ResponseCode === 0,
    transactionId: data.TranzactionInfo?.TranzactionId || null,
    token: data.TokenInfo?.Token || null,
    last4: data.TokenInfo?.CardLast4Digits || data.TranzactionInfo?.Last4CardDigitsString || "",
    expiry: data.TokenInfo
      ? `${data.TokenInfo.CardMonth}/${String(data.TokenInfo.CardYear).slice(-2)}`
      : "",
    cardHolder: data.TranzactionInfo?.CardOwnerName || "",
    brand: data.TranzactionInfo?.CardInfo || "Card",
    raw: data
  };
}

// Charge a previously-tokenized card without the customer re-entering
// anything — used for repeat utility-bill payments once a card is on file.
async function chargeWithToken({ token, amount, description }) {
  requireConfig();

  const res = await fetch(`${BASE_URL}/Transactions/Transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TerminalNumber: process.env.CARDCOM_TERMINAL,
      ApiName: process.env.CARDCOM_API_NAME,
      Amount: amount,
      Token: {
        Token: token
      },
      ProductName: description || "MoveMate payment",
      ISOCoinId: 1
    })
  });

  const data = await res.json();

  if (data.ResponseCode !== 0) {
    const error = new Error(data.Description || "Charge failed");
    error.cardcom = data;
    throw error;
  }

  return {
    success: true,
    transactionId: data.TranzactionId
  };
}

module.exports = {
  isConfigured,
  createLowProfile,
  getLowProfileResult,
  chargeWithToken
};
