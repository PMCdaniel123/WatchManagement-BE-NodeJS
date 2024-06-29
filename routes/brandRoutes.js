const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { protect, admin } = require("../middleware/auth");

router
  .route("/")
  // Get all brands
  .get(brandController.getAllBrands)
  // Create a brand (Admin only)
  .post(protect, admin, brandController.createBrand);

router
  .route("/:id")
  // Update a brand (Admin only)
  .patch(protect, admin, brandController.updateBrand)
  // Delete a brand (Admin only)
  .delete(protect, admin, brandController.deleteBrand);

module.exports = router;
