const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }],
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: false
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false
    },
    chatType: {
      type: String,
      enum: ["buyer-seller", "seller-builder"],
      required: true
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true,
    autoIndex: false 
  }
);


module.exports = mongoose.model("Chat", chatSchema);