const { Op } = require("sequelize");
const Message = require("../models/message");

const createMessage = async (req, res) => {
  const { sender, receiver, content } = req.body;
  try {
    const message = await Message.create({ sender, receiver, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({ order: [["createdAt", "ASC"]] });
    res.json(messages);
  } catch (err) {
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
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

const getRecentUsers = async (req, res) => {
  const { username } = req.params;

  try {
    const recentMessages = await Message.findAll({
      where: {
        [Op.or]: [{ sender: username }, { receiver: username }],
      },
      order: [["createdAt", "DESC"]],
      attributes: ["sender", "receiver"],
    });

    const uniqueUsers = [];
    const userSet = new Set();

    recentMessages.forEach((msg) => {
      const otherUser = msg.sender === username ? msg.receiver : msg.sender;
      if (!userSet.has(otherUser)) {
        userSet.add(otherUser);
        uniqueUsers.push({ user_name: otherUser });
      }
    });

    res.json(uniqueUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recent users" });
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
};
