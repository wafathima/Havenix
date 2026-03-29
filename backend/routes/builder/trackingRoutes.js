// const express = require("express");
// const router = express.Router();
// const {
//   getTrackingEntries,
//   createTrackingEntry,
//   updateTrackingEntry,
//   deleteTrackingEntry,
//   getMilestones,
//   createMilestone,
//   updateMilestone,
//   deleteMilestone,
//   getTrackingAnalytics,
//   getTrackingSummary
// } = require("../../controllers/builder/trackingController");
// const protect = require("../../middleware/user/authMiddleware");
// const trackingUpload = require("../../middleware/trackingUploadMiddleware");

// router.use(protect);

// router.get("/summary", getTrackingSummary);

// router.get("/analytics/:projectId", getTrackingAnalytics);

// router.post("/:projectId", trackingUpload.array("media", 10), createTrackingEntry);

// router.get("/:projectId", getTrackingEntries);
// router.put("/:id", trackingUpload.array("media", 10), updateTrackingEntry);
// router.delete("/:id", deleteTrackingEntry);

// router.get("/milestones/:projectId", getMilestones);
// router.post("/milestones", createMilestone);
// router.put("/milestones/:id", updateMilestone);
// router.delete("/milestones/:id", deleteMilestone);

// module.exports = router;

// trackingRoutes.js
const express = require("express");
const router = express.Router();
const {
  getTrackingEntries,
  createTrackingEntry,
  updateTrackingEntry,
  deleteTrackingEntry,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getTrackingAnalytics,
  getTrackingSummary
} = require("../../controllers/builder/trackingController");
const protect = require("../../middleware/user/authMiddleware");
const trackingUpload = require("../../middleware/trackingUploadMiddleware");

router.use(protect);

// Summary and analytics routes
router.get("/summary", getTrackingSummary);
router.get("/analytics/:projectId", getTrackingAnalytics);

// Milestone routes
router.get("/milestones/:projectId", getMilestones);
router.post("/milestones", createMilestone);
router.put("/milestones/:id", updateMilestone);
router.delete("/milestones/:id", deleteMilestone);

// Tracking entry routes
router.post("/:projectId", trackingUpload.array("media", 10), createTrackingEntry);
router.get("/:projectId", getTrackingEntries);
router.put("/:id", trackingUpload.array("media", 10), updateTrackingEntry);
router.delete("/:id", deleteTrackingEntry);

module.exports = router;