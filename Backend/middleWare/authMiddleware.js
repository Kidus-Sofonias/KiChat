const { StatusCodes } = require("http-status-codes");

function authMiddleware(req, res, next) {
  if (!req.session || !req.session.user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication denied" });
  }

  // Set req.user from session
  req.user = req.session.user;

  next();
}

module.exports = authMiddleware;
