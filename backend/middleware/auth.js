const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.id;
    req.user = decoded;

    next();

  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = verifyToken;