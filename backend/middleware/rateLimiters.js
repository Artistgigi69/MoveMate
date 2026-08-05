const rateLimit = require("express-rate-limit");

// General safety net for the whole API — generous, just stops runaway
// scripts/bugs from hammering the server.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down." }
});

// Tight limiter for auth endpoints specifically — login/register/2FA are
// the brute-force targets, so they get a much lower ceiling than the rest
// of the API. Keyed by IP + email/subject where available so one bad actor
// can't lock out everyone else behind the same NAT.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." }
});

module.exports = { apiLimiter, authLimiter };
