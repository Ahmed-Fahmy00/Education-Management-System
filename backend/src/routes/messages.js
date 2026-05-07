const express = require("express");
const controller = require("../controllers/messages");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.post(
  "/",
  requireRole(["student", "parent", "professor", "ta"]),
  controller.sendMessage,
);
router.get("/inbox", controller.listInbox);
router.get("/outbox", controller.listOutbox);
router.get("/chats/all", controller.listAllChats);
router.get("/conversation", controller.getConversation);

module.exports = router;
