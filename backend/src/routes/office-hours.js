const express = require("express");
const router = express.Router();
const {
  createOfficeHour,
  getOfficeHoursByStaff,
  deleteOfficeHour,
} = require("../controllers/officeHourController");
const { attachUser, requireRole } = require("../middleware/auth");

// POST /api/office-hours -> Add new slot (Professor/TA only)
router.post(
  "/",
  attachUser,
  requireRole(["professor", "TA", "instructor"]),
  createOfficeHour
);

// GET /api/office-hours/:staffId -> Return all slots + computed status
router.get("/:staffId", getOfficeHoursByStaff);

// DELETE /api/office-hours/:id -> Delete slot (owner only)
router.delete(
  "/:id",
  attachUser,
  requireRole(["professor", "TA", "instructor"]),
  deleteOfficeHour
);

module.exports = router;
