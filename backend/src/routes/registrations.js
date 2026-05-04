const express = require("express");
const controller = require("../controllers/registrations");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listRegistrations);
router.post("/", requireRole(["student", "admin"]), controller.registerStudent);
router.patch(
  "/:id",
  requireRole(["student", "admin"]),
  controller.updateRegistration,
);

module.exports = router;
