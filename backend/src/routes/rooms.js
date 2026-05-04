const express = require("express");
const controller = require("../controllers/rooms");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listRooms);
router.get("/availability", controller.listAvailableRooms);
router.post("/", requireRole(["admin"]), controller.createRoom);

module.exports = router;
