const store = require("../db/store");

const emitMessageToUsers = (app, message) => {
  const io = app.get("io");

  if (!io || !message) {
    return;
  }

  [message.sender, message.receiver]
    .filter(Boolean)
    .forEach((username) => io.to(username).emit("receive_message", message));
};

const createMessage = async (req, res) => {
  const { sender, receiver, content } = req.body;

  try {
    const message = await store.createMessage({ sender, receiver, content });
    emitMessageToUsers(req.app, message);
    res.status(201).json(message);
  } catch (error) {
    console.error("Failed to save message:", error.message);
    res.status(500).json({ error: "Failed to save message" });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await store.listMessages();
    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const getMessagesBetweenUsers = async (req, res) => {
  const { senderId, receiverId } = req.query;

  if (!senderId || !receiverId) {
    return res
      .status(400)
      .json({ error: "senderId and receiverId are required" });
  }

  try {
    const messages = await store.listConversation(senderId, receiverId);
    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch conversation:", error.message);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

const getRecentUsers = async (req, res) => {
  const { username } = req.params;

  try {
    const users = await store.listRecentUsers(username);
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch recent users:", error.message);
    res.status(500).json({ error: "Failed to fetch recent users" });
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
  emitMessageToUsers,
};
