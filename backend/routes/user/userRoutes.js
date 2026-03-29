const express = require("express");
const router = express.Router();
const { getSellers, getBuilders } = require("../../controllers/user/userController");
const protect = require("../../middleware/user/authMiddleware");

router.use(protect);

router.get("/sellers", getSellers);
router.get("/builders", getBuilders);

module.exports = router;
