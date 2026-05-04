const express = require("express");
const controller = require("../controllers/maintenance");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", requireRole(["admin", "staff"]), controller.listReports);
router.post("/", controller.createReport);
router.patch(
  "/:id/status",
  requireRole(["admin", "staff"]),
  controller.updateReportStatus,
);

module.exports = router;
