const express = require("express");
const router = express.Router(); // Initialize express router

// importing user controllers
const {
  register,
  login,
  checkUser,
  getAllUsers,
} = require("../controller/userController");
const authMiddleware = require("../middleWare/authMiddleware");

// register user route
router.post("/register", register);

// login user route
router.post("/login", login);

// check user route
router.get("/check", authMiddleware, checkUser);

router.get("/all", authMiddleware, getAllUsers);


module.exports = router;
