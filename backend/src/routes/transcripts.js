const express = require("express");
const controller = require("../controllers/transcripts");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/:studentId", controller.getTranscript);
router.put("/:studentId", requireRole(["admin"]), controller.upsertTranscript);
router.post("/:studentId/generate", requireRole(["admin"]), controller.generateTranscript);

module.exports = router;
