const express = require("express");
const router = express.Router();
const {
  createPurchaseRequest,
  getBuilderPurchaseRequests,
  getSellerPurchaseRequests,
  acceptPurchaseRequest,
  rejectPurchaseRequest
} = require("../../controllers/seller/purchaseRequestController");
const protect = require("../../middleware/user/authMiddleware");

router.use(protect);

router.post("/", createPurchaseRequest);

router.get("/builder", getBuilderPurchaseRequests);

router.get("/seller", getSellerPurchaseRequests);

router.put("/:requestId/accept", acceptPurchaseRequest);
router.put("/:requestId/reject", rejectPurchaseRequest);

module.exports = router;