const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const watchController = require("../controllers/watchController");

router
  .route("/")
  // Get all watches
  .get(watchController.getAllWatches)
  // Create a watch (Admin only)
  .post(protect, admin, watchController.createWatch);
// Filter watches by brand name
router.get("/filter", watchController.filterByBrandNames);
// Search watch by name
router.get("/search", watchController.searchByWatchName);

router
  .route("/:id")
  // Get watch by ID
  .get(watchController.getWatchById)
  // Update a watch (Admin only)
  .put(protect, admin, watchController.updateWatch)
  // Delete a watch (Admin only)
  .delete(protect, admin, watchController.deleteWatch);

// Add comment to watch
router.route("/:id/comment").post(protect, watchController.addComment);
router.route("/admin/watch/:id").get(protect, admin, watchController.getWatchByIdAdmin);

// Update and delete comment from watch
router
  .route("/:id/comment/:commentId")
  .put(protect, watchController.updateComment)
  .delete(protect, watchController.deleteComment);

module.exports = router;
