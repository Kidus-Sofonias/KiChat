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

const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const currentUsername = req.user?.user_name;

  if (!messageId) {
    return res.status(400).json({ error: "messageId is required" });
  }

  try {
    const deletedMessage = await store.deleteMessage(messageId, currentUsername);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({
      message: "Message deleted successfully",
      deletedMessage,
    });
  } catch (error) {
    if (error.code === "FORBIDDEN") {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    console.error("Failed to delete message:", error.message);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

module.exports = {
  createMessage,
  deleteMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
  emitMessageToUsers,
};
