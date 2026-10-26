const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token" });
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  // A deleted account's tokens stay valid for their lifetime otherwise.
  try {
    if (!(await User.exists({ _id: decoded.id }))) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    return next(error);
  }

  req.userId = decoded.id;
  req.user = decoded;

  next();
}

module.exports = verifyToken;
