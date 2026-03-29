const express = require("express");
const router = express.Router();
const {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  deleteChat
} = require("../../controllers/user/chatController");
const protect = require("../../middleware/user/authMiddleware");

router.use(protect);
router.post("/", getOrCreateChat);
router.get("/", getUserChats);
router.get("/:chatId/messages", getChatMessages);
router.post("/:chatId/messages", sendMessage);
router.delete("/:chatId", deleteChat);


module.exports = router;