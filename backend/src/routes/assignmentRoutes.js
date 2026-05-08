const express = require("express");
const router = express.Router();
const {
  createAssignment,
  deleteAssignment,
  getStaffCourses,
  getAllCourses,
  getAllAssignments
} = require("../controllers/assignmentController");
const { attachUser, requireRole } = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");

// Apply Rate Limiting (50 requests per 15 mins for Admin operations)
router.use(rateLimiter(50, 15 * 60 * 1000));

// Common Auth
router.use(attachUser);

// Admin Routes: Assignment Matrix
router.post("/", requireRole(["admin"]), createAssignment);
router.get("/", requireRole(["admin"]), getAllAssignments);
router.delete("/:id", requireRole(["admin"]), deleteAssignment);

// Staff/Shared Routes
router.get("/courses", getAllCourses); // List all available courses
router.get("/staff/:id/courses", getStaffCourses); // Get specific staff's assignments

module.exports = router;
