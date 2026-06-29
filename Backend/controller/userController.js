const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const store = require("../db/store");

// Fix #9: Increased bcrypt rounds from 10 → 12 (current industry recommendation)
const BCRYPT_ROUNDS = 12;

// Fix #12: Username rules — 3–30 chars, letters/numbers/underscores/hyphens only
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

// Fix #11: Password strength — min 8 chars, must contain at least one uppercase,
// one lowercase, one digit, and one special character
const PASSWORD_RULES = [
  { test: (p) => p.length >= 8,            msg: "Password must be at least 8 characters" },
  { test: (p) => /[A-Z]/.test(p),          msg: "Password must contain at least one uppercase letter" },
  { test: (p) => /[a-z]/.test(p),          msg: "Password must contain at least one lowercase letter" },
  { test: (p) => /[0-9]/.test(p),          msg: "Password must contain at least one number" },
  { test: (p) => /[^a-zA-Z0-9]/.test(p),  msg: "Password must contain at least one special character" },
];

const validatePassword = (password) => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return rule.msg;
  }
  return null;
};

async function register(req, res) {
  const { user_name, password, avatar_seed = "byte-bot" } = req.body;

  if (!user_name || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }

  // Fix #12: Validate username format
  if (!USERNAME_REGEX.test(user_name)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Username must be 3–30 characters and can only contain letters, numbers, underscores, or hyphens",
    });
  }

  // Fix #11: Validate password strength
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: passwordError });
  }

  try {
    const existingUser = await store.findUserByUsername(user_name);

    if (existingUser) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Username is already taken" });
    }

    // Fix #9: bcrypt rounds bumped to 12
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await store.createUser({
      user_name,
      password: hashedPassword,
      avatar_seed,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "User created successfully", avatar_seed });
  } catch (error) {
    console.error("Register error:", error.message, error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

async function login(req, res) {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide username and password" });
  }

  try {
    const user = await store.findUserByUsername(user_name);

    // Use same message for not found vs wrong password to prevent user enumeration
    if (!user || !user.password) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid username or password" });
    }

    // Update last seen on login
    await store.updateUser(user.user_id, { last_seen: new Date() });

    const token = jwt.sign(
      { user_id: user.user_id, user_name: user.user_name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(StatusCodes.OK).json({
      msg: "User login successful",
      user_name: user.user_name,
      user_id: user.user_id,
      avatar_seed: user.avatar_seed,
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message, error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

async function checkUser(req, res) {
  const { user_id } = req.user;

  try {
    const user = await store.findUserById(user_id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    return res.status(StatusCodes.OK).json({
      msg: "Valid user",
      user_id: user.user_id,
      user_name: user.user_name,
      avatar_seed: user.avatar_seed,
      last_seen: user.last_seen,
    });
  } catch (error) {
    console.error("CheckUser error:", error.message, error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Error verifying user" });
  }
}

async function getAllUsers(req, res) {
  const currentUserId = req.user.user_id;

  try {
    const users = await store.listOtherUsers(currentUserId);
    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message, error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Unable to fetch users" });
  }
}

// Fix #19: Dedicated lightweight endpoint for last_seen — used by the 15s frontend poll.
// Only touches the last_seen column instead of loading the full user list each time.
async function getUserStatus(req, res) {
  const { username } = req.params;

  try {
    const user = await store.findUserByUsername(username);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    return res.status(StatusCodes.OK).json({
      user_name: user.user_name,
      last_seen: user.last_seen,
      avatar_seed: user.avatar_seed,
    });
  } catch (error) {
    console.error("GetUserStatus error:", error.message, error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to get user status" });
  }
}

async function updateLastSeen(req, res) {
  const { user_id } = req.user;

  try {
    await store.updateUser(user_id, { last_seen: new Date() });
    return res.status(StatusCodes.OK).json({ msg: "Last seen updated" });
  } catch (error) {
    console.error("UpdateLastSeen error:", error.message, error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to update last seen" });
  }
}

module.exports = {
  register,
  login,
  checkUser,
  getAllUsers,
  getUserStatus,
  updateLastSeen,
};
