const express = require("express");
const controller = require("../controllers/rooms");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);

// Static paths must come before /:roomId
router.get("/available", controller.getAvailableRooms);        // EMS-101 / EMS-103
router.get("/status", controller.getRoomsStatus);              // EMS-104
router.get("/availability", controller.listAvailableRooms);    // legacy
router.get("/", controller.listRooms);
router.post("/", requireRole(["admin"]), controller.createRoom);

router.get("/:roomId/timetable", controller.getRoomTimetable); // EMS-102

module.exports = router;
