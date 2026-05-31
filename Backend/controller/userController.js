const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const store = require("../db/store");

async function register(req, res) {
  const { user_name, password, avatar_seed = "byte-bot" } = req.body;

  if (!user_name || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }

  try {
    const existingUser = await store.findUserByUsername(user_name);

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

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid username or password" });
    }

    if (!user.password) {
      console.error('Login error: stored password missing for user', user.user_name);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Server error' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid username or password" });
    }

    // Update last seen timestamp
    await store.updateUser(user.user_id, { last_seen: new Date() });

    const token = jwt.sign(
      { user_id: user.user_id, user_name: user.user_name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
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
    // Update last seen timestamp
    await store.updateUser(user_id, { last_seen: new Date() });
    
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
  updateLastSeen,
};
