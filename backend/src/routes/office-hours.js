const express = require("express");
const controller = require("../controllers/office-hours");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listOfficeHours);
router.post(
  "/",
  requireRole(["professor", "ta"]),
  controller.publishOfficeHour,
);

module.exports = router;
