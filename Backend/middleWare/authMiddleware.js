const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const store = require("../db/store");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // ✅ Check for missing or badly formatted headers
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[AuthMiddleware] Authentication denied: No token provided for", req.method, req.path);
    console.error("[AuthMiddleware] Auth header:", authHeader ? `"${authHeader.substring(0, 20)}..."` : "missing");
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
    store.updateUser(decoded.user_id, { last_seen: new Date() }).catch(err => {
      console.error("[AuthMiddleware] Failed to update last seen:", err.message);
    });
    
    next();
  } catch (error) {
    console.error("[AuthMiddleware] JWT verification failed:", error.message, "for", req.method, req.path);

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
