const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

// Fix #3: Removed per-request last_seen DB write from middleware.
// last_seen is updated on: login, socket connect/disconnect, and explicit
// POST /api/users/last-seen calls. Writing on every request caused thousands
// of unnecessary DB writes per minute under normal usage.

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Token expired. Please log in again." });
    }

    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
