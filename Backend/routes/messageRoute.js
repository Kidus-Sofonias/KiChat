const express = require("express");
const router = express.Router();

const {
  createMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
} = require("../controller/messageController");

router.post("/", createMessage);
router.get("/", getMessages);
router.get("/between", getMessagesBetweenUsers);
router.get("/recent/:username", getRecentUsers);

module.exports = router;
