const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const generateToken = require("../../utils/generateToken");
const PasswordReset = require("../../models/PasswordReset")
const { sendPasswordResetEmail } = require("../../utils/emailService")

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || null,
      address: "",
      zipCode: "",
      city: "",
      phoneNo: "",
      bio: "",
      profilePic: "",
      bgGradient: "from-[#0a2a5e] to-[#1e4b8a]",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      zipCode: user.zipCode,
      city: user.city,
      phoneNo: user.phoneNo,
      bio: user.bio,
      profilePic: user.profilePic,
      bgGradient: user.bgGradient,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    // CHECK IF USER IS BLOCKED - ADD THIS
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: "Your account has been blocked. Please contact administrator.",
        isBlocked: true,
        blockedReason: user.blockedReason || "Account blocked by administrator",
        blockedAt: user.blockedAt
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      zipCode: user.zipCode,
      city: user.city,
      phoneNo: user.phoneNo,
      bio: user.bio,
      profilePic: user.profilePic,
      bgGradient: user.bgGradient,
      isBlocked: user.isBlocked, // Include this in response
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // CHECK IF USER IS BLOCKED
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: "Your account has been blocked. Please contact administrator.",
        isBlocked: true,
        blockedReason: user.blockedReason
      });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    console.log("Update profile request received:", req.body);
    console.log("User ID:", req.user._id);
    
    const { name, address, zipCode, city, phoneNo, bio, bgGradient, role } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (address !== undefined) user.address = address;
    if (zipCode !== undefined) user.zipCode = zipCode;
    if (city !== undefined) user.city = city;
    if (phoneNo !== undefined) user.phoneNo = phoneNo;
    if (bio !== undefined) user.bio = bio;
    if (bgGradient !== undefined) user.bgGradient = bgGradient;
    if (role !== undefined) user.role = role;

    const updatedUser = await user.save();
    console.log("User updated successfully:", updatedUser.email);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      address: updatedUser.address,
      zipCode: updatedUser.zipCode,
      city: updatedUser.city,
      phoneNo: updatedUser.phoneNo,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      bgGradient: updatedUser.bgGradient,
      token: generateToken(updatedUser),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE PIC =================
exports.updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File uploaded:", req.file);
    
    const profilePicUrl = `/uploads/profile/${req.file.filename}`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.profilePic = profilePicUrl;
    await user.save();

    res.json({
      message: "Profile picture updated successfully",
      profilePic: profilePicUrl,
    });
  } catch (error) {
    console.error("Profile pic upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE USER ROLE =================
exports.updateUserRole = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!["buyer", "seller", "builder"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(200).json({ 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    }

    await PasswordReset.deleteMany({ userId: user._id });

    const resetToken = crypto.randomBytes(32).toString("hex");
    
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000)
    });

    await sendPasswordResetEmail(email, resetToken, user.name);

    res.status(200).json({ 
      message: "If an account exists with this email, you will receive a password reset link." 
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const user = await User.findById(resetRecord.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await PasswordReset.deleteOne({ _id: resetRecord._id });

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// ================= VERIFY RESET TOKEN =================
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ valid: false });
    }

    res.status(200).json({ valid: true });

  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ valid: false });
  }
};

// ================= GOOGLE LOGIN =================
exports.googleLogin = async (req, res) => {
  try {
    const { name, email, profilePic, firebaseUid } = req.body;

    console.log("📥 Google login request received:", { name, email, firebaseUid });

    if (!email || !firebaseUid) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        success: false,
        message: "Email and Firebase UID are required" 
      });
    }

    // Check if user exists by email
    let user = await User.findOne({ email });
    console.log("🔍 User found by email:", user ? "Yes" : "No");

    if (user) {
      // User exists - update Firebase UID if not set
      if (!user.firebaseUid) {
        console.log("📝 Updating existing user with Firebase UID");
        user.firebaseUid = firebaseUid;
        if (profilePic && !user.profilePic) {
          user.profilePic = profilePic;
        }
        await user.save();
      }
    } else {
      // Create new user
      console.log("🆕 Creating new user from Google login");
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        profilePic: profilePic || "",
        firebaseUid,
        role: "buyer", // Default role
        address: "",
        zipCode: "",
        city: "",
        phoneNo: "",
        bio: "",
        bgGradient: "charcoal",
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.log("🚫 User is blocked");
      return res.status(403).json({ 
        success: false,
        message: "Your account has been blocked. Please contact administrator.",
        isBlocked: true,
        blockedReason: user.blockedReason,
        blockedAt: user.blockedAt
      });
    }

    // Generate token using your existing generateToken function
    const token = generateToken(user);
    console.log("✅ Login successful for:", user.email);

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      zipCode: user.zipCode,
      city: user.city,
      phoneNo: user.phoneNo,
      bio: user.bio,
      profilePic: user.profilePic,
      bgGradient: user.bgGradient,
      isBlocked: user.isBlocked,
      token,
    });

  } catch (error) {
    console.error("❌ Google login error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      message: "Server error during Google login" 
    });
  }
};