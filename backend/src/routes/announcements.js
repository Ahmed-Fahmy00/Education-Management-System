const express = require("express");
const controller = require("../controllers/announcements");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listAnnouncements);
router.get("/general", controller.getGeneralAnnouncements);
router.get("/course/:courseId", controller.getAnnouncementsByCourse);
router.get("/instructor/:instructorId", controller.getAnnouncementsByInstructor);
router.post(
  "/",
  requireRole(["instructor", "admin"]),
  controller.createAnnouncement,
);
router.patch(
  "/:id",
  requireRole(["instructor", "admin"]),
  controller.updateAnnouncement,
);
router.delete(
  "/:id",
  requireRole(["instructor", "admin"]),
  controller.deleteAnnouncement,
);

module.exports = router;
