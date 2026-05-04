const express = require("express");
const controller = require("../controllers/meetings");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listMeetingRequests);
router.post("/", requireRole(["student"]), controller.createMeetingRequest);
router.patch(
  "/:id/respond",
  requireRole(["professor"]),
  controller.respondMeetingRequest,
);

module.exports = router;
