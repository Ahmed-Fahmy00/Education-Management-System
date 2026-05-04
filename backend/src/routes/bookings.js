const express = require("express");
const controller = require("../controllers/bookings");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listBookings);
router.post(
  "/",
  requireRole(["staff", "admin", "professor", "ta"]),
  controller.createBooking,
);

module.exports = router;
