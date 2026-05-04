const express = require("express");
const controller = require("../controllers/admissions");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.post("/", controller.createApplication);
router.get("/", requireRole(["admin"]), controller.listApplications);
router.patch(
  "/:id/status",
  requireRole(["admin"]),
  controller.updateApplicationStatus,
);

module.exports = router;
