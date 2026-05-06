const express = require("express");
const controller = require("../controllers/bookings");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

const bookerRoles = ["staff", "admin", "professor", "ta"];

router.use(attachUser);

// Static paths before /:id
router.get("/calendar", controller.getCalendarBookings);          // EMS-102
router.get("/", controller.listBookings);
router.post("/", requireRole(bookerRoles), controller.createBooking);
router.delete("/:id", requireRole(bookerRoles), controller.deleteBooking);

module.exports = router;
