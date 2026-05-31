const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const store = require("../db/store");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // ✅ Check for missing or badly formatted headers
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Authentication denied: No token provided");
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info from token
    
    // Update last seen timestamp for active user
    store.updateUser(decoded.user_id, { last_seen: new Date() });
    
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    // ✅ Check if the error is specifically due to token expiration
    if (error.name === "TokenExpiredError") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Token expired. Please log in again." });
    }

    // ✅ Generic error for other JWT issues
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
