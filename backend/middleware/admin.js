const User = require("../models/User");

// Staff are the accounts whose email is listed in ADMIN_EMAILS (comma
// separated). Runs after verifyToken.

function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("email");
    if (!user || !adminEmails().includes(user.email.toLowerCase())) {
      return res.status(403).json({ message: "Admins only" });
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireAdmin, adminEmails };
