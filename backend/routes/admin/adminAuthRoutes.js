const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
} = require("../../controllers/admin/adminAuthController");

const protectAdmin = require("../../middleware/admin/adminAuthMiddleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.get("/dashboard", protectAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;
