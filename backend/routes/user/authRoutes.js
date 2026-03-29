const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../../middleware/user/authMiddleware");
const {
  registerUser,
  loginUser,
  updateUserRole,
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePic,
  forgotPassword,      
  resetPassword,       
  verifyResetToken,  
  googleLogin  
} = require("../../controllers/user/authController");

const uploadDir = path.join(__dirname, "../../uploads/profile");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/update-role", updateUserRole);

// Password reset routes (public)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post(
  "/upload-profile-pic",
  protect,
  upload.single("profilePic"),
  updateProfilePic
);
router.post("/google-login", googleLogin);
module.exports = router;