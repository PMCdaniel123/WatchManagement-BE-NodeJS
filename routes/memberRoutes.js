const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const memberController = require("../controllers/memberController");

router
  .route("/profile")
  // Get member profile
  .get(protect, memberController.getMemberProfile)
  // Update member profile
  .put(protect, memberController.updateMemberProfile);

// Get all members (Admin only)
router.get("/", protect, admin, memberController.getAllMembers);

// Update member password
router.put("/update-pwd", protect, memberController.updatePassword);

module.exports = router;
