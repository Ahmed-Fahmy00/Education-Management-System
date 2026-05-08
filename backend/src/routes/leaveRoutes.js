const express = require("express");
const router = express.Router();
const {
  createLeaveRequest,
  getMyRequests,
  getAllRequests,
  updateLeaveStatus
} = require("../controllers/leaveController");
const { attachUser, requireRole } = require("../middleware/auth");

// All leave routes require authentication
router.use(attachUser);

// Staff: Submit leave request
router.post("/", createLeaveRequest);

// Staff: View own requests
router.get("/my", getMyRequests);

// Admin: View all requests (can filter via query params)
router.get("/", requireRole(["admin"]), getAllRequests);

// Admin: Approve or Reject
router.put("/:id/status", requireRole(["admin"]), updateLeaveStatus);

module.exports = router;
