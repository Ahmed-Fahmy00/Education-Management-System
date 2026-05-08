const express = require("express");
const controller = require("../controllers/maintenance");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listReports);              // filtering is done in controller
router.post("/", controller.createReport);            // any authenticated user can report
router.get("/open-count", requireRole(["admin"]), controller.openCount);
router.patch(
  "/:id/status",
  requireRole(["admin", "staff"]),
  controller.updateReportStatus,
);

module.exports = router;
