const express = require("express");
const router = express.Router();
const {
  getBuilderProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} = require("../../controllers/builder/propertyController");
const protect = require("../../middleware/user/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

router.use(protect);
router.use((req, res, next) => {
  if (req.user.role !== 'builder') {
    return res.status(403).json({ message: "Access denied. Builder only." });
  }
  next();
});

router.get("/", getBuilderProperties);
router.get("/:id", getProperty);
router.post("/", upload.array("images", 10), createProperty);
router.put("/:id", upload.array("images", 10), updateProperty);
router.delete("/:id", deleteProperty);

module.exports = router;