const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    helpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved"
    },
    response: {
      comment: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      respondedAt: Date
    }
  },
  { timestamps: true }
);

reviewSchema.statics.calculateAverageRating = async function(propertyId) {
  try {
    const result = await this.aggregate([
      { 
        $match: { 
          property: new mongoose.Types.ObjectId(propertyId), 
          status: "approved" 
        } 
      },
      { 
        $group: {
          _id: "$property",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    const Property = mongoose.model("Property");
    await Property.findByIdAndUpdate(propertyId, {
      averageRating: result[0]?.averageRating || 0,
      totalReviews: result[0]?.totalReviews || 0
    });
  } catch (error) {
    console.error("Error calculating average rating:", error);
  }
};

module.exports = mongoose.model("Review", reviewSchema);