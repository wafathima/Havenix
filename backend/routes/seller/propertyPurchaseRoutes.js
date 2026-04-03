const express = require("express");
const router = express.Router();
const {
  getAvailableProperties,
  getPurchasedProperties,
  purchaseProperty
} = require("../../controllers/seller/propertyPurchaseController");
const protect = require("../../middleware/user/authMiddleware");

router.use(protect);

router.get("/available", getAvailableProperties);

router.get("/my-purchased", getPurchasedProperties);

router.post("/purchase/:propertyId", purchaseProperty);

module.exports = router;