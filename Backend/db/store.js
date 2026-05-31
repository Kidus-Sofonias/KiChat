const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const sequelize = require("./config");
const User = require("../models/user");
const Message = require("../models/message");

const dataDirectory = path.join(__dirname, "..", "data");
const dataFilePath = path.join(dataDirectory, "local-store.json");

let providerPromise;
let activeProviderName = "pending";
const truthyValues = new Set(["1", "true", "yes", "on"]);
const shouldAlterSchema = truthyValues.has(
  String(process.env.DB_SYNC_ALTER || "false").trim().toLowerCase()
);
const maxDatabaseInitAttempts = Number(process.env.DB_INIT_RETRIES || 3);
const databaseRetryDelayMs = Number(process.env.DB_INIT_RETRY_DELAY_MS || 2000);

const defaultLocalStore = {
  nextUserId: 1,
  nextMessageId: 1,
  users: [],
  messages: [],
};

const hasDatabaseConfig = () => sequelize.isConfigured;

const ensureLocalStoreExists = async () => {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(defaultLocalStore, null, 2),
      "utf8"
    );
  }
};

const readLocalStore = async () => {
  await ensureLocalStoreExists();
  const rawData = await fs.readFile(dataFilePath, "utf8");
  const normalizedData = rawData.replace(/^\uFEFF/, "").trim();

  return normalizedData ? JSON.parse(normalizedData) : { ...defaultLocalStore };
};

const writeLocalStore = async (store) => {
  await fs.writeFile(dataFilePath, JSON.stringify(store, null, 2), "utf8");
};

const toPlainObject = (record) =>
  record && typeof record.toJSON === "function" ? record.toJSON() : record;

const localProvider = {
  async findUserByUsername(user_name) {
    const store = await readLocalStore();

    const user = store.users.find((entry) => entry.user_name === user_name);

    return user
      ? { ...user, avatar_seed: user.avatar_seed || "byte-bot" }
      : null;
  },

  async findUserById(user_id) {
    const store = await readLocalStore();

    const user = store.users.find((entry) => entry.user_id === Number(user_id));

    return user
      ? { ...user, avatar_seed: user.avatar_seed || "byte-bot" }
      : null;
  },

  async updateUser(user_id, updates) {
    const store = await readLocalStore();
    const userIndex = store.users.findIndex(
      (entry) => entry.user_id === Number(user_id)
    );

    if (userIndex < 0) {
      return null;
    }

    store.users[userIndex] = {
      ...store.users[userIndex],
      ...updates,
    };
    await writeLocalStore(store);

    return { ...store.users[userIndex] };
  },
  // New method to update by username
  async updateUserByName(user_name, updates) {
    const store = await readLocalStore();
    const userIndex = store.users.findIndex(
      (entry) => entry.user_name === user_name
    );

    if (userIndex < 0) {
      return null;
    }

    store.users[userIndex] = {
      ...store.users[userIndex],
      ...updates,
    };
    await writeLocalStore(store);

    return { ...store.users[userIndex] };
  },

  async createUser({ user_name, password, avatar_seed = "byte-bot" }) {
    const store = await readLocalStore();
    const user = {
      user_id: store.nextUserId++,
      user_name,
      password,
      avatar_seed,
      last_seen: new Date().toISOString(),
    };

    store.users.push(user);
    await writeLocalStore(store);

    return user;
  },

  async listOtherUsers(currentUserId) {
    const store = await readLocalStore();

    return store.users
      .filter((user) => user.user_id !== Number(currentUserId))
      .map(({ user_id, user_name, avatar_seed, last_seen }) => ({
        user_id,
        user_name,
        avatar_seed: avatar_seed || "byte-bot",
        last_seen,
      }));
  },

  async createMessage(messageInput, replyData = {}) {
    const store = await readLocalStore();
    const timestamp = new Date().toISOString();
    const message = {
      _id: String(store.nextMessageId++),
      sender: messageInput.sender,
      receiver: messageInput.receiver,
      content: messageInput.content,
      isFile: Boolean(messageInput.isFile),
      fileType: messageInput.fileType || null,
      caption: messageInput.caption || "",
      fileUrl: messageInput.fileUrl || "",
      replyTo: replyData.replyTo || null,
      replyToContent: replyData.replyToContent || null,
      replyToSender: replyData.replyToSender || null,
      reactions: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.messages.push(message);
    await writeLocalStore(store);

    return message;
  },

  async listMessages() {
    const store = await readLocalStore();

    return [...store.messages].sort(
      (first, second) => new Date(first.createdAt) - new Date(second.createdAt)
    );
  },

  async listConversation(senderId, receiverId) {
    const store = await readLocalStore();

    return store.messages
      .filter(
        (message) =>
          (message.sender === senderId && message.receiver === receiverId) ||
          (message.sender === receiverId && message.receiver === senderId)
      )
      .sort(
        (first, second) =>
          new Date(first.createdAt) - new Date(second.createdAt)
      );
  },

  async listRecentUsers(username) {
    const store = await readLocalStore();
    const recentMessages = [...store.messages]
      .filter(
        (message) =>
          message.sender === username || message.receiver === username
      )
      .sort(
        (first, second) =>
          new Date(second.createdAt) - new Date(first.createdAt)
      );

    const uniqueUsers = [];
    const userSet = new Set();

    recentMessages.forEach((message) => {
      const otherUser =
        message.sender === username ? message.receiver : message.sender;

      if (!userSet.has(otherUser)) {
        userSet.add(otherUser);
        uniqueUsers.push({ user_name: otherUser });
      }
    });

    return uniqueUsers;
  },

  async deleteMessage(messageId, currentUsername) {
    const store = await readLocalStore();
    const messageIndex = store.messages.findIndex(
      (message) => String(message._id) === String(messageId)
    );

    if (messageIndex < 0) {
      return null;
    }

    const message = store.messages[messageIndex];

    if (message.sender !== currentUsername) {
      const error = new Error("FORBIDDEN");
      error.code = "FORBIDDEN";
      throw error;
    }

    store.messages.splice(messageIndex, 1);
    await writeLocalStore(store);

    return message;
  },

  async getMessageById(messageId) {
    const store = await readLocalStore();
    return store.messages.find(
      (message) => String(message._id) === String(messageId)
    );
  },

  async addReaction(messageId, emoji, username) {
    const store = await readLocalStore();
    const message = store.messages.find(
      (msg) => String(msg._id) === String(messageId)
    );

    if (!message) {
      return null;
    }

    if (!message.reactions) {
      message.reactions = {};
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = [];
    }

    if (!message.reactions[emoji].includes(username)) {
      message.reactions[emoji].push(username);
    }

    message.updatedAt = new Date().toISOString();
    await writeLocalStore(store);

    return message;
  },

  async removeReaction(messageId, emoji, username) {
    const store = await readLocalStore();
    const message = store.messages.find(
      (msg) => String(msg._id) === String(messageId)
    );

    if (!message) {
      return null;
    }

    if (message.reactions && message.reactions[emoji]) {
      message.reactions[emoji] = message.reactions[emoji].filter(
        (u) => u !== username
      );

      if (message.reactions[emoji].length === 0) {
        delete message.reactions[emoji];
      }
    }

    message.updatedAt = new Date().toISOString();
    await writeLocalStore(store);

    return message;
  },
};

const sequelizeProvider = {
  async findUserByUsername(user_name) {
    const user = await User.findOne({ where: { user_name } });
    return toPlainObject(user);
  },

  async findUserById(user_id) {
    const user = await User.findOne({
      where: { user_id },
      attributes: ["user_id", "user_name", "password", "avatar_seed", "last_seen"],
    });
    
    return toPlainObject(user);
  },

  async updateUser(user_id, updates) {
    const user = await User.findByPk(user_id);
    if (!user) {
      return null;
    }

    await user.update(updates);
    return toPlainObject(user);
  },

  async updateUserByName(user_name, updates) {
    const user = await User.findOne({ where: { user_name } });
    if (!user) {
      return null;
    }

    await user.update(updates);
    return toPlainObject(user);
  },

  async createUser({ user_name, password, avatar_seed = "byte-bot" }) {
    const user = await User.create({ user_name, password, avatar_seed });
    return toPlainObject(user);
  },

  async listOtherUsers(currentUserId) {
    const users = await User.findAll({
      where: {
        user_id: { [Op.ne]: currentUserId },
      },
      attributes: ["user_id", "user_name", "avatar_seed", "last_seen"],
    });

    return users.map(toPlainObject);
  },

  async createMessage(messageInput, replyData = {}) {
    const message = await Message.create({
      sender: messageInput.sender,
      receiver: messageInput.receiver,
      content: messageInput.content,
      isFile: Boolean(messageInput.isFile),
      fileType: messageInput.fileType || null,
      fileUrl: messageInput.fileUrl || "",
      caption: messageInput.caption || "",
      replyTo: replyData.replyTo || null,
      replyToContent: replyData.replyToContent || null,
      replyToSender: replyData.replyToSender || null,
      reactions: {},
    });

    return toPlainObject(message);
  },

  async listMessages() {
    const messages = await Message.findAll({ order: [["createdAt", "ASC"]] });
    return messages.map(toPlainObject);
  },

  async listConversation(senderId, receiverId) {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    return messages.map(toPlainObject);
  },

  async listRecentUsers(username) {
    const recentMessages = await Message.findAll({
      where: {
        [Op.or]: [{ sender: username }, { receiver: username }],
      },
      order: [["createdAt", "DESC"]],
      attributes: ["sender", "receiver"],
    });

    const uniqueUsers = [];
    const userSet = new Set();

    recentMessages.forEach((message) => {
      const otherUser =
        message.sender === username ? message.receiver : message.sender;

      if (!userSet.has(otherUser)) {
        userSet.add(otherUser);
        uniqueUsers.push({ user_name: otherUser });
      }
    });

    return uniqueUsers;
  },

  async deleteMessage(messageId, currentUsername) {
    const message = await Message.findByPk(messageId);

    if (!message) {
      return null;
    }

    if (message.sender !== currentUsername) {
      const error = new Error("FORBIDDEN");
      error.code = "FORBIDDEN";
      throw error;
    }

    const deletedMessage = toPlainObject(message);
    await message.destroy();
    return deletedMessage;
  },

  async getMessageById(messageId) {
    const message = await Message.findByPk(messageId);
    return message ? toPlainObject(message) : null;
  },

  async addReaction(messageId, emoji, username) {
    const message = await Message.findByPk(messageId);

    if (!message) {
      return null;
    }

    const reactions = message.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(username)) {
      reactions[emoji].push(username);
    }

    message.reactions = reactions;
    await message.save();

    return toPlainObject(message);
  },

  async removeReaction(messageId, emoji, username) {
    const message = await Message.findByPk(messageId);

    if (!message) {
      return null;
    }

    const reactions = message.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((u) => u !== username);

      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    message.reactions = reactions;
    await message.save();

    return toPlainObject(message);
  },
};

const initializeProvider = async () => {
  // No database configuration – abort with a clear error
  if (!hasDatabaseConfig()) {
    const err = new Error(
      "Database configuration missing. Please set DATABASE_URL and related environment variables."
    );
    err.code = "DB_CONFIG_MISSING";
    throw err;
  }

  for (let attempt = 1; attempt <= maxDatabaseInitAttempts; attempt += 1) {
    try {
      await sequelize.ensureDatabaseExists();
      await sequelize.authenticate();
      await sequelize.sync({ alter: shouldAlterSchema });
      // Ensure last_seen column exists for userTable (needed for UI)
      try {
        await sequelize.getQueryInterface().addColumn('userTable', 'last_seen', {
          type: require('sequelize').DataTypes.DATE,
          allowNull: true,
          defaultValue: require('sequelize').DataTypes.NOW,
        });
      } catch (e) {
        // Column may already exist; ignore errors
      }
      activeProviderName = "database";
      return sequelizeProvider;
    } catch (error) {
      const isLastAttempt = attempt === maxDatabaseInitAttempts;
      if (isLastAttempt) {
        // Propagate a clear, user‑friendly error instead of silently falling back
        const friendly = new Error(
          `Unable to connect to the database after ${maxDatabaseInitAttempts} attempts: ${error.message}`
        );
        friendly.code = "DB_CONNECTION_FAILED";
        throw friendly;
      }
      console.warn(
        `${sequelize.databaseLabel} initialization attempt ${attempt} failed: ${error.message}. Retrying in ${databaseRetryDelayMs}ms.`
      );
      await new Promise((resolve) => setTimeout(resolve, databaseRetryDelayMs));
    }
  }
};

const getProvider = async () => {
  if (!providerPromise) {
    providerPromise = initializeProvider();
  }

  return providerPromise;
};

const callProvider = async (methodName, ...args) => {
  const provider = await getProvider();
  return provider[methodName](...args);
};

module.exports = {
  findUserByUsername: (...args) => callProvider("findUserByUsername", ...args),
  findUserById: (...args) => callProvider("findUserById", ...args),
  createUser: (...args) => callProvider("createUser", ...args),
  listOtherUsers: (...args) => callProvider("listOtherUsers", ...args),
  createMessage: (...args) => callProvider("createMessage", ...args),
  listMessages: (...args) => callProvider("listMessages", ...args),
  listConversation: (...args) => callProvider("listConversation", ...args),
  listRecentUsers: (...args) => callProvider("listRecentUsers", ...args),
  deleteMessage: (...args) => callProvider("deleteMessage", ...args),
  getMessageById: (...args) => callProvider("getMessageById", ...args),
  addReaction: (...args) => callProvider("addReaction", ...args),
  removeReaction: (...args) => callProvider("removeReaction", ...args),
  // Added export for updateUser to fix login error
  updateUser: (...args) => callProvider("updateUser", ...args),
  getStorageStatus: async () => {
    await getProvider();

    return {
      configured: sequelize.isConfigured,
      databaseDialect: sequelize.databaseDialect,
      databaseLabel: sequelize.databaseLabel,
      activeProvider: activeProviderName,
    };
  },
  // Helper to update user by username, works for both providers
  updateUserByName: async (user_name, updates) => {
    const provider = await getProvider();
    if (provider.updateUserByName) {
      return provider.updateUserByName(user_name, updates);
    }
    // Fallback: find user then update by id
    const user = await provider.findUserByUsername(user_name);
    if (!user) return null;
    return provider.updateUser(user.user_id, updates);
  },
};
