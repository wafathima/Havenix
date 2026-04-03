const mongoose = require("mongoose");

const purchaseRequestSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    builder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    message: {
      type: String,
      default: ""
    },
    respondedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseRequest", purchaseRequestSchema);