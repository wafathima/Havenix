const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getProjectsStats,
  getPropertiesStats,

  getUsers,
  getUserById,
  blockUser,
  unblockUser,
  deleteUser,
  updateUserRole,

  getProperties,
  getPropertyById,
  deleteProperty,
  updatePropertyStatus,
  
  getProjects,
  getProjectById,
  deleteProject,
  updateProjectStatus,
  updateProjectBudget
} = require("../../controllers/admin/adminController");
const protect = require("../../middleware/user/authMiddleware");
const adminProtect = require("../../middleware/admin/adminAuthMiddleware");

router.use(protect);
router.use(adminProtect);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/projects/stats", getProjectsStats);
router.get("/properties/stats", getPropertiesStats);

// User management routes
router.get("/users", getUsers);
router.get("/users/:userId", getUserById);
router.patch("/users/:userId/block", blockUser);
router.patch("/users/:userId/unblock", unblockUser);
router.patch("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);

// Property management routes 
router.get("/properties", getProperties);
router.get("/properties/:propertyId", getPropertyById);
router.delete("/properties/:propertyId", deleteProperty);
router.patch("/properties/:propertyId/status", updatePropertyStatus);

// Project management routes
router.get("/projects", getProjects);
router.get("/projects/:projectId", getProjectById);
router.delete("/projects/:projectId", deleteProject);
router.patch("/projects/:projectId/status", updateProjectStatus);
router.patch("/projects/:projectId/budget", updateProjectBudget);

module.exports = router;