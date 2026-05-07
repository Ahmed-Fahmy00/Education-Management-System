const express = require("express");
const controller = require("../controllers/staff");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listProfiles);
router.post("/", requireRole(["admin"]), controller.createProfile);
router.patch(
  "/:id",
  requireRole(["admin", "employee"]),
  controller.updateProfile,
);
router.delete("/:id", requireRole(["admin"]), controller.deleteProfile);

module.exports = router;
