const express = require("express");
const controller = require("../controllers/announcements");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listAnnouncements);
router.post(
  "/",
  requireRole(["professor", "ta"]),
  controller.createAnnouncement,
);
router.patch(
  "/:id",
  requireRole(["professor", "ta"]),
  controller.updateAnnouncement,
);
router.delete(
  "/:id",
  requireRole(["professor", "ta"]),
  controller.deleteAnnouncement,
);

module.exports = router;
