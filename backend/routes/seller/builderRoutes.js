const express = require("express");
const router = express.Router();
const {
  getAvailableBuilderProperties,
  getBuilderProjects,
  getBuilderProject,
  getBuilderProperty
} = require("../../controllers/seller/builderPropertyController");
const protect = require("../../middleware/user/authMiddleware");

router.use(protect);

router.use((req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: "Access denied. Seller only." });
  }
  next();
});

router.get("/properties", getAvailableBuilderProperties);

router.get("/projects", getBuilderProjects);

router.get("/projects/:id", getBuilderProject);

router.get("/properties/:id", getBuilderProperty);

module.exports = router;