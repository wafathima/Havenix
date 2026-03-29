const express = require("express");
const router = express.Router();
const { getDashboard } = require("../../controllers/user/dashboardController");
const protect = require("../../middleware/user/authMiddleware");

router.get("/", protect, getDashboard);

module.exports = router;
