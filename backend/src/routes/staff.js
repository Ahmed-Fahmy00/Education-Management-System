const express = require("express");
const {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
} = require("../controllers/staffController");
const { attachUser } = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

// Apply Rate Limiting (100 requests per 15 mins)
router.use(rateLimiter(100, 15 * 60 * 1000));

// attachUser is used on all routes to detect user context
router.use(attachUser);


module.exports = router;
