const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken"); // 🔥 JWT for auth
const User = require("../models/user");

// ✅ Register User
async function register(req, res) {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }

  try {
    const existingUser = await User.findOne({ where: { user_name } });
    if (existingUser) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "User already registered" });
    }

    if (password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Password must be at least 8 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      user_name,
      password: hashedPassword,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "User created successfully" });
  } catch (error) {
    console.error("Register error:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

// ✅ Login User (Using JWT)
async function login(req, res) {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide username and password" });
  }

  try {
    const user = await User.findOne({ where: { user_name } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid username or password" });
    }

    // 🔥 Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, user_name: user.user_name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(StatusCodes.OK).json({
      msg: "User login successful",
      user_name: user.user_name,
      user_id: user.user_id,
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

// ✅ Check Authenticated User
async function checkUser(req, res) {
  const { user_id } = req.user;

  try {
    const user = await User.findOne({
      where: { user_id },
      attributes: ["user_id", "user_name"],
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    return res.status(StatusCodes.OK).json({
      msg: "Valid user",
      user_id: user.user_id,
      user_name: user.user_name,
    });
  } catch (error) {
    console.error("CheckUser error:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Error verifying user" });
  }
}

// ✅ Get All Users Except Current
async function getAllUsers(req, res) {
  const currentUserId = req.user.user_id;
  console.log("Fetching users, currentUserId:", currentUserId);

  try {
    const users = await User.findAll({
      where: {
        user_id: { [Op.ne]: currentUserId },
      },
      attributes: ["user_id", "user_name"],
    });

    return res.status(StatusCodes.OK).json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Unable to fetch users" });
  }
}

module.exports = {
  register,
  login,
  checkUser,
  getAllUsers,
};
