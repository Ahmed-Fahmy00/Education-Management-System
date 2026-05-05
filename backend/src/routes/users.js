const express = require("express");
const {
  register,
  login,
  getPendingApplications,
  approveApplication,
  rejectApplication,
  getApplicationStatus,
} = require("../controllers/users");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/application-status/:email", getApplicationStatus);
router.get("/admin/pending-applications", getPendingApplications);
router.post("/admin/approve/:applicationId", approveApplication);
router.post("/admin/reject/:applicationId", rejectApplication);

module.exports = router;
