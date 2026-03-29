const express = require("express");
const router = express.Router();
const {
  getMyProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} = require("../../controllers/seller/propertyController");
const protect = require("../../middleware/user/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

router.use(protect);

router.get("/", getMyProperties);

router.get("/:id", getProperty);

router.post("/", upload.array("images", 10), createProperty);

router.put("/:id", upload.array("images", 10), updateProperty);

router.delete("/:id", deleteProperty);

module.exports = router;