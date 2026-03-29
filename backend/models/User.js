const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,  
      default: null,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "builder"],
      default: null,
    },
    address: {
      type: String,
      default: "",
    },
    zipCode: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    phoneNo: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    bgGradient: {
      type: String,
      default: "from-[#0a2a5e] to-[#1e4b8a]",
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    firebaseUid: {
      type: String,
      default: null,
      unique: true,
      sparse: true 
    },
    blockedReason: {
      type: String,
      default: null
    },
    blockedAt: {
      type: Date,
      default: null
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);