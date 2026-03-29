const express = require("express");
const router = express.Router();
const {
  getMyProjects,
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getPublicProject
} = require("../../controllers/builder/projectController");
const protect = require("../../middleware/user/authMiddleware");
const builderUpload = require("../../middleware/builderUploadMiddleware");

router.use(protect);

router.get("/all", getAllProjects);
router.get("/public/:id", getPublicProject);

// Builder's own projects
router.get("/my", getMyProjects);
router.get("/stats", getProjectStats);

router.get("/my/:id", getProject); 
router.get("/:id", getProject);  

// Create, update, delete operations
router.post("/", builderUpload.array("images", 10), createProject);
router.put("/:id", builderUpload.array("images", 10), updateProject);
router.delete("/:id", deleteProject);

module.exports = router;