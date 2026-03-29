const express = require("express");
const router = express.Router();
const {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getUserReviews
} = require("../../controllers/user/reviewController");
const protect = require("../../middleware/user/authMiddleware");

// Public routes
router.get("/property/:propertyId", getPropertyReviews); 

// Protected routes
router.post("/", protect, createReview);
router.get("/user", protect, getUserReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/helpful", protect, markHelpful);

module.exports = router;