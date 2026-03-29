const express = require("express");
const router = express.Router();

const {
  createEnquiry,
  getBuyerEnquiries,
  getSellerEnquiries,
  markAsRead,
  createContactEnquiry,
  respondToEnquiry,
  getSellerContact
} = require("../../controllers/user/enquiryController");
const protect = require("../../middleware/user/authMiddleware");

router.post("/contact", createContactEnquiry);

router.post("/", protect, createEnquiry);
router.get("/buyer", protect, getBuyerEnquiries);
router.get("/seller", protect, getSellerEnquiries);
router.patch("/:id/read", protect, markAsRead);
router.patch("/:id/respond", protect, respondToEnquiry);


router.patch("/:id/respond", protect, respondToEnquiry);
router.get("/:id/seller-contact", protect, getSellerContact);

module.exports = router;