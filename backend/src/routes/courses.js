const express = require("express");
const controller = require("../controllers/courses");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/requirements", controller.listStudentRequirements);
router.get("/instructor/:instructorId", controller.getCoursesByInstructorId);
router.get("/", controller.listCourses);
router.post("/", requireRole(["admin"]), controller.createCourse);
router.get("/:id", controller.getCourse);
router.patch("/:id", requireRole(["admin"]), controller.updateCourse);
router.delete("/:id", requireRole(["admin"]), controller.deleteCourse);

module.exports = router;
